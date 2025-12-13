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

    event EarningsClaimed(
        address indexed relayer,
        address indexed token,
        uint256 amount
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
        // ========== CHECKS ==========
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // ========== INTERACTIONS (External call first - mixer.withdraw) ==========
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

        // ========== EFFECTS ==========
        // Calculate relayer fee and update state BEFORE user transfer
        uint256 relayerFee = (amount * RELAYER_FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 userAmount = amount - relayerFee;

        // Store relayer earnings (state update before external call)
        ethEarnings[msg.sender] += relayerFee;

        // ========== INTERACTIONS (User transfer after state update) ==========
        // Send to user - state already updated, safe from reentrancy
        (bool success,) = recipient.call{value: userAmount, gas: 2300}("");
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
        // ========== CHECKS ==========
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // ========== INTERACTIONS (External call first - mixer.withdraw) ==========
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

        // ========== EFFECTS ==========
        // Calculate relayer fee and update state BEFORE user transfer
        uint256 relayerFee = (amount * RELAYER_FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 userAmount = amount - relayerFee;

        // Store relayer earnings (state update before external call)
        usdcEarnings[msg.sender] += relayerFee;

        // ========== INTERACTIONS (User transfer after state update) ==========
        // Send to user - state already updated, safe from reentrancy
        bool success = USDC.transfer(recipient, userAmount);
        require(success, "USDC transfer failed");

        emit RelayedWithdrawal(msg.sender, recipient, address(USDC), userAmount, relayerFee);
    }

    // Relayer can claim earnings
    // Following CEI pattern: Checks -> Effects -> Interactions
    // Enhanced with balance checks and event emission
    function claimETHEarnings() external nonReentrant {
        // ========== CHECKS ==========
        uint256 amount = ethEarnings[msg.sender];
        require(amount > 0, "No ETH earnings to claim");
        
        // Verify contract has sufficient balance (prevents silent failures)
        require(address(this).balance >= amount, "Insufficient contract balance");

        // ========== EFFECTS ==========
        // Update state BEFORE external call (prevents reentrancy)
        // This is critical: state is updated before any external interaction
        ethEarnings[msg.sender] = 0;

        // ========== INTERACTIONS ==========
        // External call only after state update
        // Using low-level call with explicit gas limit for safety
        (bool success,) = msg.sender.call{value: amount, gas: 2300}("");
        require(success, "ETH transfer failed");

        // Emit event for transparency and tracking
        emit EarningsClaimed(msg.sender, ETH, amount);
    }

    function claimUSDCEarnings() external nonReentrant {
        // ========== CHECKS ==========
        uint256 amount = usdcEarnings[msg.sender];
        require(amount > 0, "No USDC earnings to claim");
        
        // Verify contract has sufficient token balance
        require(USDC.balanceOf(address(this)) >= amount, "Insufficient USDC balance");

        // ========== EFFECTS ==========
        // Update state BEFORE external call (prevents reentrancy)
        // This is critical: state is updated before any external interaction
        usdcEarnings[msg.sender] = 0;

        // ========== INTERACTIONS ==========
        // External call only after state update
        // Using safe transfer pattern
        bool success = USDC.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");

        // Emit event for transparency and tracking
        emit EarningsClaimed(msg.sender, address(USDC), amount);
    }

    function claimEURCEarnings() external nonReentrant {
        // ========== CHECKS ==========
        uint256 amount = eurcEarnings[msg.sender];
        require(amount > 0, "No EURC earnings to claim");
        
        // Verify contract has sufficient token balance
        require(EURC.balanceOf(address(this)) >= amount, "Insufficient EURC balance");

        // ========== EFFECTS ==========
        // Update state BEFORE external call (prevents reentrancy)
        // This is critical: state is updated before any external interaction
        eurcEarnings[msg.sender] = 0;

        // ========== INTERACTIONS ==========
        // External call only after state update
        // Using safe transfer pattern
        bool success = EURC.transfer(msg.sender, amount);
        require(success, "EURC transfer failed");

        // Emit event for transparency and tracking
        emit EarningsClaimed(msg.sender, address(EURC), amount);
    }

    // View functions
    function getETHEarnings(address relayer) external view returns (uint256) {
        return ethEarnings[relayer];
    }

    function getUSDCEarnings(address relayer) external view returns (uint256) {
        return usdcEarnings[relayer];
    }

    function getEURCEarnings(address relayer) external view returns (uint256) {
        return eurcEarnings[relayer];
    }

    // Update mixer address (only owner)
    function updateMixer(address _mixer) external onlyOwner {
        mixer = IMixer(_mixer);
    }

    // Emergency functions (only owner)
    // Following CEI pattern for consistency
    function emergencyWithdrawETH() external onlyOwner nonReentrant {
        // ========== CHECKS ==========
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        // ========== EFFECTS ==========
        // No state changes needed for emergency withdrawal

        // ========== INTERACTIONS ==========
        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "ETH emergency withdrawal failed");
    }

    function emergencyWithdrawToken(address token) external onlyOwner nonReentrant {
        // ========== CHECKS ==========
        require(token != address(0), "Invalid token");
        ERC20 tokenContract = ERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        // ========== EFFECTS ==========
        // No state changes needed for emergency withdrawal

        // ========== INTERACTIONS ==========
        bool success = tokenContract.transfer(owner(), balance);
        require(success, "Token emergency withdrawal failed");
    }

    // Receive function for ETH
    receive() external payable {}
}
