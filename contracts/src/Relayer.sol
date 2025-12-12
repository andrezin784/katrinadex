// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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

contract KatrinaDEXRelayer is Ownable, ReentrancyGuard {
    IMixer public mixer;

    // Fee structure (0.1% = 1 basis point for relayer)
    uint256 public constant RELAYER_FEE_BASIS_POINTS = 10; // 0.1%
    uint256 public constant BASIS_POINTS = 10000;

    // Supported tokens
    address public constant ETH = address(0);
    ERC20 public immutable USDC;
    ERC20 public immutable EURC; // Added EURC

    // Relayer earnings
    mapping(address => uint256) public ethEarnings;
    mapping(address => uint256) public usdcEarnings;
    mapping(address => uint256) public eurcEarnings; // Added EURC earnings

    // Events
    event RelayedWithdrawal(
        address indexed relayer,
        address indexed recipient,
        address indexed token,
        uint256 amount,
        uint256 relayerFee
    );

    constructor(address _mixer, address _usdc, address _eurc) Ownable(msg.sender) {
        mixer = IMixer(_mixer);
        USDC = ERC20(_usdc);
        EURC = ERC20(_eurc);
    }

    function relayWithdrawalETH(
        uint256[2] memory proofA,
        uint256[2][2] memory proofB,
        uint256[2] memory proofC,
        uint256[3] memory proofInput,
        address payable recipient,
        uint256 amount,
        uint256 poolIndex
    ) external nonReentrant {
        // Call mixer withdraw with relayer as recipient
        mixer.withdraw(
            proofA,
            proofB,
            proofC,
            proofInput,
            ETH,
            payable(address(this)),
            amount,
            poolIndex
        );

        // Calculate relayer fee
        uint256 relayerFee = (amount * RELAYER_FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 userAmount = amount - relayerFee;

        // Store relayer earnings
        ethEarnings[msg.sender] += relayerFee;

        // Send to user
        (bool success,) = recipient.call{value: userAmount}("");
        require(success, "ETH transfer failed");

        emit RelayedWithdrawal(msg.sender, recipient, ETH, userAmount, relayerFee);
    }

    function relayWithdrawalUSDC(
        uint256[2] memory proofA,
        uint256[2][2] memory proofB,
        uint256[2] memory proofC,
        uint256[3] memory proofInput,
        address recipient,
        uint256 amount,
        uint256 poolIndex
    ) external nonReentrant {
        // Call mixer withdraw with relayer as recipient
        mixer.withdraw(
            proofA,
            proofB,
            proofC,
            proofInput,
            address(USDC),
            payable(address(this)),
            amount,
            poolIndex
        );

        // Calculate relayer fee
        uint256 relayerFee = (amount * RELAYER_FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 userAmount = amount - relayerFee;

        // Store relayer earnings
        usdcEarnings[msg.sender] += relayerFee;

        // Send to user
        require(USDC.transfer(recipient, userAmount), "USDC transfer failed");

        emit RelayedWithdrawal(msg.sender, recipient, address(USDC), userAmount, relayerFee);
    }

    // Relayer can claim earnings
    function claimETHEarnings() external nonReentrant {
        uint256 amount = ethEarnings[msg.sender];
        require(amount > 0, "No ETH earnings to claim");

        ethEarnings[msg.sender] = 0;
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function claimUSDCEarnings() external nonReentrant {
        uint256 amount = usdcEarnings[msg.sender];
        require(amount > 0, "No USDC earnings to claim");

        usdcEarnings[msg.sender] = 0;
        require(USDC.transfer(msg.sender, amount), "USDC transfer failed");
    }

    // View functions
    function getETHEarnings(address relayer) external view returns (uint256) {
        return ethEarnings[relayer];
    }

    function getUSDCEarnings(address relayer) external view returns (uint256) {
        return usdcEarnings[relayer];
    }

    // Update mixer address (only owner)
    function updateMixer(address _mixer) external onlyOwner {
        mixer = IMixer(_mixer);
    }

    // Emergency functions (only owner)
    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawToken(address token) external onlyOwner {
        ERC20(token).transfer(owner(), ERC20(token).balanceOf(address(this)));
    }

    // Receive function for ETH
    receive() external payable {}
}
