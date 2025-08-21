// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Reward.sol";

contract NewsNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;
    mapping(uint256 => string) public newsSummaries;
    Reward public rewardContract;
    address public agent;

    event NewsNFTMinted(address indexed user, uint256 tokenId, string metadataURI);

    constructor(address _rewardContract) ERC721("NewsNFT", "NNEWS") Ownable(msg.sender) {
        rewardContract = Reward(_rewardContract);
    }

    function mintNewsNFT(string memory _newsSummary, string memory _metadataURI) external {
        _mintNews(msg.sender, _newsSummary, _metadataURI);
    }

    function mintNewsNFTByAgent(address user, string memory _newsSummary, string memory _metadataURI) external {
        require(msg.sender == agent, "Only the authorized agent can mint NFTs");
        _mintNews(user, _newsSummary, _metadataURI);
    }
    function _mintNews(address user, string memory _newsSummary, string memory _metadataURI) internal {
        uint256 tokenId = nextTokenId;
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, _metadataURI);
        newsSummaries[tokenId] = _newsSummary;
        nextTokenId++;

        rewardContract.updateReward(user, 0, 1);

        emit NewsNFTMinted(user, tokenId, _metadataURI);
    }


    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }

    function getNewsSummary(uint256 tokenId) external view returns (string memory) {
        return newsSummaries[tokenId];
    }
}
