// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error PriceTooLow();
error MarketPlaceNotApproved();
error AlreadyListed(address nftAdress, uint256 tokenId);
error OnlyOwnerCanListItems();
error NotListed(address nftAddress, uint256 tokenId);
error PriceNotMet(address nftAddress, uint256 tokenId);

contract NFTMarketPlace {
    struct Listing {
        uint256 price;
        address seller;
    }
    //state variables
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    //modifiers
    modifier notListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price == 0) {
            revert NotListed(nftAddress, tokenId);
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

    //events
    event ItemListed(address nftAddress, uint256 tokenId, uint256 price);
    event Itembought(
        address nftAddress,
        uint256 tokenId,
        address buyer,
        address seller
    );

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
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (listedItem.price < msg.value) {
            revert PriceNotMet(nftAddress, tokenId);
        }

        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);

        IERC721 nft = IERC721(nftAddress);
        nft.safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit Itembought(nftAddress, tokenId, msg.sender, listedItem.seller);
    }
}
