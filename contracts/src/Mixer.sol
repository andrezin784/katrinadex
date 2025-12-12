// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

    interface IVerifier {
        function verifyProof(
            uint256[2] memory a,
            uint256[2][2] memory b,
            uint256[2] memory c,
            uint256[3] memory input
        ) external view returns (bool);
    }

interface ILicitProofVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external view returns (bool);
}

contract KatrinaDEXMixer is ERC20, Ownable, ReentrancyGuard {
    IVerifier public mixerVerifier;
    ILicitProofVerifier public licitProofVerifier;

    // Pool sizes (separate for ETH, USDC, and EURC due to different decimals)
    uint256[] public ethPoolSizes;
    uint256[] public usdcPoolSizes;
    uint256[] public eurcPoolSizes;

    // Supported tokens
    address public constant ETH = address(0);
    ERC20 public immutable USDC;
    ERC20 public immutable EURC;

    // Fee structure (0.3% = 3 basis points)
    uint256 public constant FEE_BASIS_POINTS = 30; // 0.3%
    uint256 public constant BASIS_POINTS = 10000;

    // Commitments storage
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public nullifiers;

    // Pool balances
    mapping(uint256 => uint256) public ethPoolBalances;
    mapping(uint256 => uint256) public usdcPoolBalances;
    mapping(uint256 => uint256) public eurcPoolBalances;

    // Events
    event Deposit(
        bytes32 indexed commitment,
        address indexed token,
        uint256 amount,
        uint256 poolIndex
    );

    event Withdrawal(
        bytes32 indexed nullifier,
        address indexed token,
        uint256 amount,
        address indexed recipient
    );

    constructor(
        address _mixerVerifier,
        address _licitProofVerifier,
        address _usdc,
        address _eurc,
        uint256[] memory _ethPoolSizes,
        uint256[] memory _usdcPoolSizes,
        uint256[] memory _eurcPoolSizes
    ) ERC20("KatrinaDEX Note", "KNOTE") Ownable(msg.sender) {
        mixerVerifier = IVerifier(_mixerVerifier);
        licitProofVerifier = ILicitProofVerifier(_licitProofVerifier);
        USDC = ERC20(_usdc);
        EURC = ERC20(_eurc);
        ethPoolSizes = _ethPoolSizes;
        usdcPoolSizes = _usdcPoolSizes;
        eurcPoolSizes = _eurcPoolSizes;
    }

    function depositETH(
        bytes32 commitment,
        uint256 poolIndex,
        uint256[2] memory licitProofA,
        uint256[2][2] memory licitProofB,
        uint256[2] memory licitProofC,
        uint256[3] memory licitProofInput
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount>0");
        require(poolIndex < ethPoolSizes.length, "Invalid pool");
        require(ethPoolSizes[poolIndex] == msg.value, "Amount mismatch");
        require(!commitments[commitment], "Exists");

        // Verify licit origin proof
        require(
            licitProofVerifier.verifyProof(
                licitProofA,
                licitProofB,
                licitProofC,
                licitProofInput
            ),
            "Invalid licit"
        );

        // Store commitment
        commitments[commitment] = true;

        // Add to pool balance
        ethPoolBalances[poolIndex] += msg.value;

        emit Deposit(commitment, ETH, msg.value, poolIndex);
    }

    function depositUSDC(
        bytes32 commitment,
        uint256 poolIndex,
        uint256 amount,
        uint256[2] memory licitProofA,
        uint256[2][2] memory licitProofB,
        uint256[2] memory licitProofC,
        uint256[3] memory licitProofInput
    ) external nonReentrant {
        require(amount > 0, "Amt>0");
        require(poolIndex < usdcPoolSizes.length, "Idx");
        require(usdcPoolSizes[poolIndex] == amount, "Amt");
        require(!commitments[commitment], "Exist");

        // Verify licit origin proof
        require(
            licitProofVerifier.verifyProof(
                licitProofA,
                licitProofB,
                licitProofC,
                licitProofInput
            ),
            "Licit"
        );

        // Transfer USDC from user
        USDC.transferFrom(msg.sender, address(this), amount);

        // Store commitment
        commitments[commitment] = true;

        // Add to pool balance
        usdcPoolBalances[poolIndex] += amount;

        emit Deposit(commitment, address(USDC), amount, poolIndex);
    }

    function depositEURC(
        bytes32 commitment,
        uint256 poolIndex,
        uint256 amount,
        uint256[2] memory licitProofA,
        uint256[2][2] memory licitProofB,
        uint256[2] memory licitProofC,
        uint256[3] memory licitProofInput
    ) external nonReentrant {
        require(amount > 0, "Amt>0");
        require(poolIndex < eurcPoolSizes.length, "Idx");
        require(eurcPoolSizes[poolIndex] == amount, "Amt");
        require(!commitments[commitment], "Exist");

        // Verify licit origin proof
        require(
            licitProofVerifier.verifyProof(
                licitProofA,
                licitProofB,
                licitProofC,
                licitProofInput
            ),
            "Licit"
        );

        // Transfer EURC from user
        EURC.transferFrom(msg.sender, address(this), amount);

        // Store commitment
        commitments[commitment] = true;

        // Add to pool balance
        eurcPoolBalances[poolIndex] += amount;

        emit Deposit(commitment, address(EURC), amount, poolIndex);
    }

    function withdraw(
        uint256[2] memory proofA,
        uint256[2][2] memory proofB,
        uint256[2] memory proofC,
        uint256[3] memory proofInput,
        address token,
        address payable recipient,
        uint256 amount,
        uint256 poolIndex
    ) external nonReentrant {
        // Verify pool index and amount based on token
        if (token == ETH) {
            require(poolIndex < ethPoolSizes.length, "Invalid pool");
            require(amount == ethPoolSizes[poolIndex], "Amount mismatch");
        } else if (token == address(USDC)) {
            require(poolIndex < usdcPoolSizes.length, "Invalid pool");
            require(amount == usdcPoolSizes[poolIndex], "Amount mismatch");
        } else if (token == address(EURC)) {
            require(poolIndex < eurcPoolSizes.length, "Invalid pool");
            require(amount == eurcPoolSizes[poolIndex], "Amount mismatch");
        } else {
            revert("Unsupported");
        }

        // Correct Public Signals Order (Groth16): [Output1, ..., Input1, ...]
        // Circuit: output nullifierHashOut; input root; input nullifierHash;
        // proofInput[0] = nullifierHashOut
        // proofInput[1] = root (commitment)
        // proofInput[2] = nullifierHash
        
        // Verify commitment exists
        // Reading from index 1 (root)
        bytes32 commitment = bytes32(proofInput[1]);
        require(commitments[commitment], "Unknown");

        // Verify mixer ZK proof
        require(
            mixerVerifier.verifyProof(proofA, proofB, proofC, proofInput),
            "Invalid proof"
        );

        // Extract nullifier hash from proof input
        // Reading from index 2 (nullifierHash input) - could also use index 0 (output)
        bytes32 nullifierHash = bytes32(proofInput[2]);
        require(!nullifiers[nullifierHash], "Used");

        // Mark nullifier hash as used
        nullifiers[nullifierHash] = true;

        // Calculate fee
        uint256 fee = (amount * FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 netAmount = amount - fee;

        // Transfer tokens
        if (token == ETH) {
            require(ethPoolBalances[poolIndex] >= amount, "No ETH");
            ethPoolBalances[poolIndex] -= amount;

            // Send to recipient
            (bool success,) = recipient.call{value: netAmount}("");
            require(success, "ETH fail");

            // Send fee to owner
            if (fee > 0) {
                (bool feeSuccess,) = owner().call{value: fee}("");
                require(feeSuccess, "Fee fail");
            }
        } else if (token == address(USDC)) {
            require(usdcPoolBalances[poolIndex] >= amount, "No USDC");
            usdcPoolBalances[poolIndex] -= amount;

            // Transfer to recipient
            require(USDC.transfer(recipient, netAmount), "USDC fail");

            // Transfer fee to owner
            if (fee > 0) {
                require(USDC.transfer(owner(), fee), "Fee fail");
            }
        } else if (token == address(EURC)) {
            require(eurcPoolBalances[poolIndex] >= amount, "No EURC");
            eurcPoolBalances[poolIndex] -= amount;

            // Transfer to recipient
            require(EURC.transfer(recipient, netAmount), "EURC fail");

            // Transfer fee to owner
            if (fee > 0) {
                require(EURC.transfer(owner(), fee), "Fee fail");
            }
        } else {
            revert("Unsupported");
        }

        emit Withdrawal(nullifierHash, token, netAmount, recipient);
    }

    // View functions
    function getPoolBalance(address token, uint256 poolIndex) external view returns (uint256) {
        if (token == ETH) {
            return ethPoolBalances[poolIndex];
        } else if (token == address(USDC)) {
            return usdcPoolBalances[poolIndex];
        } else if (token == address(EURC)) {
            return eurcPoolBalances[poolIndex];
        }
        return 0;
    }

    function isCommitmentUsed(bytes32 commitment) external view returns (bool) {
        return commitments[commitment];
    }

    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }

    // Emergency functions (only owner)
    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawToken(address token) external onlyOwner {
        ERC20(token).transfer(owner(), ERC20(token).balanceOf(address(this)));
    }

    // Update verifiers (only owner)
    function updateMixerVerifier(address _verifier) external onlyOwner {
        mixerVerifier = IVerifier(_verifier);
    }

    function updateLicitProofVerifier(address _verifier) external onlyOwner {
        licitProofVerifier = ILicitProofVerifier(_verifier);
    }

    // Receive function for ETH deposits
    receive() external payable {}
}
