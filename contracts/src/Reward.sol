// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RewardToken} from "src/RewardToken.sol";

contract Reward is Ownable {
    RewardToken public rewardToken;
    uint256 public swipeReward = 10 * 1e18;
    uint256 public mintReward = 50 * 1e18;
    uint256 public minClaimAmount = 100 * 1e18;

    mapping(address => uint256) public userRewards;

    event RewardUpdated(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event ContractFunded(address indexed owner, uint256 amount);
    event RewardWithdrawn(address indexed owner, uint256 amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = RewardToken(_rewardToken);
    }

    function updateReward(
        address _user,
        uint256 _swipes,
        uint256 _mints
    ) external onlyOwner {
        uint256 totalReward = (_swipes * swipeReward) + (_mints * mintReward);
        userRewards[_user] += totalReward;
        emit RewardUpdated(_user, totalReward);
    }

    function claimReward() external {
        uint256 reward = userRewards[msg.sender];
        require(reward >= minClaimAmount, "Not enough rewards to claim");

        uint256 contractBalance = rewardToken.balanceOf(address(this));
        require(contractBalance >= reward, "Not enough tokens in contract");

        userRewards[msg.sender] = 0;
        require(rewardToken.transfer(msg.sender, reward), "Transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    function fundContract(uint256 amount) external onlyOwner {
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Funding failed"
        );
        emit ContractFunded(msg.sender, amount);
    }

    function withdrawExcessTokens(uint256 amount) external onlyOwner {
        uint256 contractBalance = rewardToken.balanceOf(address(this));
        require(amount <= contractBalance, "Not enough balance to withdraw");

        require(rewardToken.transfer(owner(), amount), "Withdraw failed");
        emit RewardWithdrawn(owner(), amount);
    }

    function setRewardAmounts(
        uint256 _swipeReward,
        uint256 _mintReward
    ) external onlyOwner {
        swipeReward = _swipeReward;
        mintReward = _mintReward;
    }

    function setMinClaimAmount(uint256 _minAmount) external onlyOwner {
        minClaimAmount = _minAmount;
    }
}
