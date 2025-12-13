// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KatrinaStaking
 * @notice Staking contract with reward pools and CEI pattern security
 * @dev Implements checks-effects-interactions pattern to prevent reentrancy attacks
 */
contract KatrinaStaking is Ownable, ReentrancyGuard {
    ERC20 public immutable token;
    
    struct Pool {
        uint256 rate;           // Reward rate per second per token
        uint256 totalStaked;    // Total tokens staked in this pool
        bool active;            // Pool status
        uint256 createdAt;      // Timestamp when pool was created
    }
    
    struct UserStake {
        uint256 amount;         // Amount staked
        uint256 poolId;        // Pool ID
        uint256 stakedAt;      // Timestamp when staked
        uint256 lastClaimed;   // Last reward claim timestamp
    }
    
    // Pools mapping
    mapping(uint256 => Pool) public pools;
    uint256 public poolCount;
    
    // User stakes mapping
    mapping(address => UserStake[]) public userStakes;
    
    // Total rewards claimed per user (for tracking)
    mapping(address => uint256) public totalRewardsClaimed;
    
    // Events
    event PoolAdded(uint256 indexed poolId, uint256 rate, address indexed creator);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 stakeId);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 stakeId);
    event Claimed(address indexed user, uint256 indexed poolId, uint256 amount, uint256 stakeId);
    event Rewarded(address indexed user, uint256 indexed poolId, uint256 amount, uint256 stakeId);
    event PoolDeactivated(uint256 indexed poolId);
    
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        token = ERC20(_token);
    }
    
    /**
     * @notice Add a new staking pool
     * @param _rate Reward rate per second per token (in wei)
     * @dev Requires rate > 0 to prevent ineffective pools
     */
    function addPool(uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be greater than zero");
        
        uint256 poolId = poolCount;
        pools[poolId] = Pool({
            rate: _rate,
            totalStaked: 0,
            active: true,
            createdAt: block.timestamp
        });
        
        poolCount++;
        
        emit PoolAdded(poolId, _rate, msg.sender);
    }
    
    /**
     * @notice Deactivate a pool (prevent new stakes)
     * @param _poolId Pool ID to deactivate
     */
    function deactivatePool(uint256 _poolId) external onlyOwner {
        require(_poolId < poolCount, "Invalid pool");
        require(pools[_poolId].active, "Pool already inactive");
        
        pools[_poolId].active = false;
        
        emit PoolDeactivated(_poolId);
    }
    
    /**
     * @notice Stake tokens in a pool
     * @param _poolId Pool ID to stake in
     * @param _amount Amount of tokens to stake
     */
    function stake(uint256 _poolId, uint256 _amount) external nonReentrant {
        require(_poolId < poolCount, "Invalid pool");
        require(pools[_poolId].active, "Pool inactive");
        require(_amount > 0, "Amount must be greater than zero");
        
        // Transfer tokens from user
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update state (EFFECTS)
        uint256 stakeId = userStakes[msg.sender].length;
        userStakes[msg.sender].push(UserStake({
            amount: _amount,
            poolId: _poolId,
            stakedAt: block.timestamp,
            lastClaimed: block.timestamp
        }));
        
        pools[_poolId].totalStaked += _amount;
        
        emit Staked(msg.sender, _poolId, _amount, stakeId);
    }
    
    /**
     * @notice Unstake tokens from a pool
     * @param _stakeId Stake ID to unstake
     */
    function unstake(uint256 _stakeId) external nonReentrant {
        require(_stakeId < userStakes[msg.sender].length, "Invalid stake");
        
        UserStake storage userStake = userStakes[msg.sender][_stakeId];
        require(userStake.amount > 0, "Already unstaked");
        
        uint256 amount = userStake.amount;
        uint256 poolId = userStake.poolId;
        
        // Update state BEFORE external call (EFFECTS)
        userStake.amount = 0; // Mark as unstaked
        pools[poolId].totalStaked -= amount;
        
        // External call (INTERACTIONS)
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, poolId, amount, _stakeId);
    }
    
    /**
     * @notice Calculate pending rewards for a stake
     * @param _user User address
     * @param _stakeId Stake ID
     * @return Pending reward amount
     */
    function calculateReward(address _user, uint256 _stakeId) public view returns (uint256) {
        if (_stakeId >= userStakes[_user].length) {
            return 0;
        }
        
        UserStake memory userStake = userStakes[_user][_stakeId];
        if (userStake.amount == 0 || !pools[userStake.poolId].active) {
            return 0;
        }
        
        Pool memory pool = pools[userStake.poolId];
        uint256 timeElapsed = block.timestamp - userStake.lastClaimed;
        
        // Reward = amount * rate * time
        return (userStake.amount * pool.rate * timeElapsed) / 1e18;
    }
    
    /**
     * @notice Claim rewards for a specific stake
     * @param _stakeId Stake ID to claim rewards for
     * @dev Follows CEI pattern: Checks -> Effects -> Interactions
     */
    function claim(uint256 _stakeId) external nonReentrant {
        // ========== CHECKS ==========
        require(_stakeId < userStakes[msg.sender].length, "Invalid stake");
        
        UserStake storage userStake = userStakes[msg.sender][_stakeId];
        require(userStake.amount > 0, "Stake not active");
        require(pools[userStake.poolId].active, "Pool inactive");
        
        // Calculate reward (optimized - no loops, direct calculation)
        uint256 timeElapsed = block.timestamp - userStake.lastClaimed;
        require(timeElapsed > 0, "No time elapsed");
        
        Pool memory pool = pools[userStake.poolId];
        uint256 recompensa = (userStake.amount * pool.rate * timeElapsed) / 1e18;
        require(recompensa > 0, "No rewards to claim");
        
        // Verify contract has sufficient balance
        require(token.balanceOf(address(this)) >= recompensa, "Insufficient contract balance");
        
        // ========== EFFECTS ==========
        // Update state BEFORE external call (prevents reentrancy)
        // This is critical: state is updated before any external interaction
        userStake.lastClaimed = block.timestamp;
        totalRewardsClaimed[msg.sender] += recompensa;
        
        // ========== INTERACTIONS ==========
        // External call only after state update
        // Using safe transfer pattern
        bool success = token.transfer(msg.sender, recompensa);
        require(success, "Transfer failed");
        
        emit Claimed(msg.sender, userStake.poolId, recompensa, _stakeId);
    }
    
    /**
     * @notice Reward function (if needed for manual rewards)
     * @param _user User address
     * @param _stakeId Stake ID
     * @param _amount Reward amount
     */
    function reward(address _user, uint256 _stakeId, uint256 _amount) external onlyOwner nonReentrant {
        require(_user != address(0), "Invalid user");
        require(_stakeId < userStakes[_user].length, "Invalid stake");
        require(_amount > 0, "Amount must be greater than zero");
        
        UserStake storage userStake = userStakes[_user][_stakeId];
        require(userStake.amount > 0, "Stake not active");
        
        // Update state BEFORE external call
        totalRewardsClaimed[_user] += _amount;
        
        // External call
        require(token.transfer(_user, _amount), "Transfer failed");
        
        emit Rewarded(_user, userStake.poolId, _amount, _stakeId);
    }
    
    /**
     * @notice Get user stake information
     * @param _user User address
     * @param _stakeId Stake ID
     * @return UserStake struct
     */
    function getUserStake(address _user, uint256 _stakeId) external view returns (UserStake memory) {
        require(_stakeId < userStakes[_user].length, "Invalid stake");
        return userStakes[_user][_stakeId];
    }
    
    /**
     * @notice Get total stakes count for a user
     * @param _user User address
     * @return Total number of stakes
     */
    function getUserStakesCount(address _user) external view returns (uint256) {
        return userStakes[_user].length;
    }
    
    /**
     * @notice Get pool information
     * @param _poolId Pool ID
     * @return Pool struct
     */
    function getPool(uint256 _poolId) external view returns (Pool memory) {
        require(_poolId < poolCount, "Invalid pool");
        return pools[_poolId];
    }
    
    /**
     * @notice Emergency withdraw (only owner)
     * @dev Following CEI pattern for consistency
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        require(token.transfer(owner(), balance), "Transfer failed");
    }
}

