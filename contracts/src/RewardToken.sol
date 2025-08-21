// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor() ERC20("News Shorts", "Shorts") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 1e18); 
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
