// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error PriceTooLow();
error MarketPlaceNotApproved();
error AlreadyListed(address nftAdress, uint256 tokenId);
error OnlyOwnerCanListItems();

contract NFTMarketPlace {
    struct listing {
        uint256 price;
        address seller;
    }
    //state variables
    mapping(address => mapping(uint256 => listing)) private s_listings;

    //modifiers
    modifier notListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier onlyOwner(
        address nftAddress,
        uint256 tokenId,
        address sender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);

        if (owner != sender) {
            revert OnlyOwnerCanListItems();
        }
        _;
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        onlyOwner(nftAddress, tokenId, msg.sender)
    {
        if (price < 0) {
            revert PriceTooLow();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert MarketPlaceNotApproved();
        }
        s_listings[nftAddress][tokenId] = listing(price, msg.sender);
    }
}
