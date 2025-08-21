// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { RewardToken } from "src/RewardToken.sol"
contract MyScript is Script {
     function run() external {
        vm.startBroadcast();

        RewardToken rewardToken = new FaRewardTokendra();

        // Log the deployed contract address
        console.log("Fadra deployed to:", address(rewardToken));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
