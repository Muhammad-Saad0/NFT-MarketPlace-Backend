// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_counter;

    constructor() ERC721("MyNFT", "A PUG") {
        s_counter = 0;
    }

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_counter);
        s_counter += 1;
        return s_counter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function getCounter() public view returns (uint256) {
        return s_counter;
    }
}
