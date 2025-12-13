// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMixer {
    function withdraw(
        uint256[2] memory proofA,
        uint256[2][2] memory proofB,
        uint256[2] memory proofC,
        uint256[3] memory proofInput,
        address token,
        address payable recipient,
        uint256 amount,
        uint256 poolIndex
    ) external;
}

/**
 * @title GaslessRelayer
 * @notice Permite withdrawals gasless usando EIP-712 meta-transactions
 * @dev Fee de 0.4% é deduzida do valor retirado
 */
contract GaslessRelayer is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    IMixer public immutable mixer;
    
    // Treasury address que recebe as fees
    address public treasury;
    
    // Fee de 0.4% = 40 basis points
    uint256 public constant GASLESS_FEE_BASIS_POINTS = 40; // 0.4%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Replay protection: nonce por endereço
    mapping(address => uint256) public nonces;
    
    // EIP-712 typehash para a mensagem de withdraw
    bytes32 private constant WITHDRAW_TYPEHASH = keccak256(
        "WithdrawGasless(address to,uint256 poolAmount,uint256 poolIndex,address token,uint256 nonce,uint256 deadline)"
    );
    
    // Whitelist de pool amounts fixos (para segurança)
    mapping(uint256 => bool) public allowedPoolAmounts;
    
    // Events
    event GaslessWithdraw(
        address indexed to,
        address indexed token,
        uint256 amount,
        uint256 fee,
        address indexed relayer
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PoolAmountWhitelisted(uint256 amount, bool allowed);
    
    constructor(
        address _mixer,
        address _treasury
    ) Ownable(msg.sender) EIP712("KatrinaDEXGaslessRelayer", "1") {
        require(_mixer != address(0), "Invalid mixer");
        require(_treasury != address(0), "Invalid treasury");
        
        mixer = IMixer(_mixer);
        treasury = _treasury;
    }
    
    /**
     * @notice Executa withdraw gasless usando assinatura EIP-712
     * @param to Endereço que receberá os fundos
     * @param poolAmount Valor do pool (deve estar na whitelist)
     * @param poolIndex Índice do pool
     * @param token Endereço do token (address(0) para ETH)
     * @param proofA, proofB, proofC Prova ZK
     * @param proofInput Inputs da prova ZK
     * @param signature Assinatura EIP-712 do usuário
     * @param deadline Timestamp de expiração da assinatura
     */
    function withdrawGasless(
        address to,
        uint256 poolAmount,
        uint256 poolIndex,
        address token,
        uint256[2] memory proofA,
        uint256[2][2] memory proofB,
        uint256[2] memory proofC,
        uint256[3] memory proofInput,
        bytes calldata signature,
        uint256 deadline
    ) external nonReentrant {
        // ========== CHECKS ==========
        require(block.timestamp <= deadline, "Expired");
        require(to != address(0), "Invalid recipient");
        require(allowedPoolAmounts[poolAmount], "Pool not whitelisted");
        
        // Recuperar endereço do signatário
        address signer = _recoverSigner(to, poolAmount, poolIndex, token, deadline, signature);
        require(signer != address(0), "Invalid signature");
        
        // Calcular fee = poolAmount * 0.004
        uint256 fee = (poolAmount * GASLESS_FEE_BASIS_POINTS) / BASIS_POINTS;
        require(fee > 0, "Fee too small");
        
        // Incrementar nonce do signatário (replay protection)
        uint256 currentNonce = nonces[signer];
        nonces[signer] = currentNonce + 1;
        
        // ========== EFFECTS ==========
        // (Estado atualizado no mixer durante withdraw)
        
        // ========== INTERACTIONS ==========
        // Calcular fees
        // Fee do mixer: 0.3% = 30 bps (já deduzida pelo mixer)
        // Fee gasless: 0.4% = 40 bps (sobre o poolAmount original)
        uint256 mixerFee = (poolAmount * 30) / BASIS_POINTS; // 0.3%
        uint256 gaslessFee = (poolAmount * GASLESS_FEE_BASIS_POINTS) / BASIS_POINTS; // 0.4%
        
        // O mixer transfere (poolAmount - mixerFee) para o recipient
        // Nós recebemos aqui e depois redistribuímos, deduzindo a fee gasless
        uint256 mixerNetAmount = poolAmount - mixerFee; // O que o mixer vai transferir
        uint256 finalAmount = mixerNetAmount - gaslessFee; // O que o usuário recebe
        
        // Chamar withdraw do mixer, recebendo os fundos aqui temporariamente
        mixer.withdraw(
            proofA,
            proofB,
            proofC,
            proofInput,
            token,
            payable(address(this)), // Receber aqui temporariamente
            poolAmount,
            poolIndex
        );
        
        // Agora redistribuir: usuário recebe menos a fee gasless, treasury recebe a fee
        if (token == address(0)) {
            // ETH
            (bool success1,) = payable(to).call{value: finalAmount}("");
            require(success1, "ETH transfer failed");
            
            (bool success2,) = payable(treasury).call{value: gaslessFee}("");
            require(success2, "ETH fee transfer failed");
            
            // O mixer já enviou sua fee (mixerFee) para o owner do mixer
        } else {
            // ERC20 token
            require(IERC20(token).transfer(to, finalAmount), "Token transfer failed");
            require(IERC20(token).transfer(treasury, gaslessFee), "Token fee transfer failed");
            
            // O mixer já enviou sua fee (mixerFee) para o owner do mixer
        }
        
        emit GaslessWithdraw(to, token, finalAmount, gaslessFee, msg.sender);
    }
    
    /**
     * @notice Recupera o endereço do signatário da mensagem EIP-712
     */
    function _recoverSigner(
        address to,
        uint256 poolAmount,
        uint256 poolIndex,
        address token,
        uint256 deadline,
        bytes calldata signature
    ) internal view returns (address) {
        bytes32 structHash = keccak256(
            abi.encode(
                WITHDRAW_TYPEHASH,
                to,
                poolAmount,
                poolIndex,
                token,
                nonces[to], // Usa nonce atual do 'to'
                deadline
            )
        );
        
        bytes32 hash = _hashTypedDataV4(structHash);
        return hash.recover(signature);
    }
    
    /**
     * @notice Atualiza endereço do treasury (apenas owner)
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }
    
    /**
     * @notice Adiciona/remove pool amount da whitelist (apenas owner)
     */
    function setPoolAmountWhitelist(uint256 amount, bool allowed) external onlyOwner {
        allowedPoolAmounts[amount] = allowed;
        emit PoolAmountWhitelisted(amount, allowed);
    }
    
    /**
     * @notice Batch whitelist de pool amounts
     */
    function batchWhitelistPoolAmounts(uint256[] calldata amounts, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < amounts.length; i++) {
            allowedPoolAmounts[amounts[i]] = allowed;
            emit PoolAmountWhitelisted(amounts[i], allowed);
        }
    }
    
    /**
     * @notice View function para verificar nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    /**
     * @notice View function para calcular fee
     */
    function calculateGaslessFee(uint256 amount) external pure returns (uint256) {
        return (amount * GASLESS_FEE_BASIS_POINTS) / BASIS_POINTS;
    }
    
    // Receive function para receber ETH
    receive() external payable {}
}

