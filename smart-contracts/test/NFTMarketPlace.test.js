const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

const LISTING_PRICE = ethers.utils.parseEther("1");
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("testing NFTMarketPlace", () => {
  let deployer, NFTMarketPlace, BasicNFT, user, tokenId, nftOwner;
  let NFTMarketPlaceAddress, BasicNFTAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    nftOwner = accounts[0];
    user = accounts[1];
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);

    NFTMarketPlace = await ethers.getContract("NFTMarketPlace");
    BasicNFT = await ethers.getContract("BasicNFT");

    NFTMarketPlaceAddress = await NFTMarketPlace.address;
    BasicNFTAddress = await BasicNFT.address;

    const tx = await BasicNFT.connect(nftOwner).mintNFT();
    await tx.wait(1);

    const events = await BasicNFT.queryFilter("Transfer");
    tokenId = events[0].args.tokenId;
  });

  it("only owner can list the NFT", async () => {
    await expect(
      NFTMarketPlace.connect(user).listItem(
        BasicNFTAddress,
        tokenId,
        LISTING_PRICE
      )
    ).to.be.revertedWith("OnlyOwnerCanListItems()");
  });

  it("reverts if price is zero or less", async () => {
    await BasicNFT.connect(nftOwner).approve(
      NFTMarketPlaceAddress,
      tokenId
    );
    await expect(
      NFTMarketPlace.connect(nftOwner).listItem(
        BasicNFTAddress,
        tokenId,
        ethers.utils.parseEther("0")
      )
    ).to.be.revertedWith("PriceTooLow()");
  });

  it("reverts if marketPlace is not approved", async () => {
    await expect(
      NFTMarketPlace.connect(nftOwner).listItem(
        BasicNFTAddress,
        tokenId,
        LISTING_PRICE
      )
    ).to.be.revertedWith("MarketPlaceNotApproved()");
  });

  it("checks if listing was updated", async () => {
    //listing the NFT
    await BasicNFT.connect(nftOwner).approve(
      NFTMarketPlaceAddress,
      tokenId
    );

    let tx = await NFTMarketPlace.connect(nftOwner).listItem(
      BasicNFTAddress,
      tokenId,
      LISTING_PRICE
    );
    await tx.wait(1);

    const listedItem = await NFTMarketPlace.getListing(
      BasicNFTAddress,
      tokenId
    );

    expect(listedItem.price).to.equal(LISTING_PRICE);
    expect(listedItem.seller).to.equal(nftOwner.address);
  });

  it("itemListed event was emitted", async () => {
    await BasicNFT.connect(nftOwner).approve(
      NFTMarketPlaceAddress,
      tokenId
    );

    let tx = await NFTMarketPlace.connect(nftOwner).listItem(
      BasicNFTAddress,
      tokenId,
      LISTING_PRICE
    );
    await tx.wait(1);

    const events = await NFTMarketPlace.queryFilter("ItemListed");
    expect(events[0].args.nftAddress).to.be.equal(BasicNFTAddress);
    expect(events[0].args.tokenId).to.be.equal(tokenId);
    expect(events[0].args.price).to.be.equal(LISTING_PRICE);
  });

  it("reverts if item is already listed", async () => {
    await BasicNFT.connect(nftOwner).approve(
      NFTMarketPlaceAddress,
      tokenId
    );

    let tx = await NFTMarketPlace.connect(nftOwner).listItem(
      BasicNFTAddress,
      tokenId,
      LISTING_PRICE
    );
    await tx.wait(1);

    await expect(
      NFTMarketPlace.listItem(BasicNFTAddress, tokenId, LISTING_PRICE)
    ).to.be.revertedWith("AlreadyListed");
  });

  describe("testing cancel listing", async () => {
    it("reverts if the item is not listed", async () => {
      await expect(
        NFTMarketPlace.cancelListing(BasicNFTAddress, tokenId)
      ).to.be.revertedWith("NotListed");
    });

    it("reverts if the request sender is not the owner of NFT", async () => {
      await BasicNFT.connect(nftOwner).approve(
        NFTMarketPlaceAddress,
        tokenId
      );

      let tx = await NFTMarketPlace.connect(nftOwner).listItem(
        BasicNFTAddress,
        tokenId,
        LISTING_PRICE
      );
      await tx.wait(1);
      await expect(
        NFTMarketPlace.connect(user).cancelListing(
          BasicNFTAddress,
          tokenId
        )
      ).to.be.revertedWith("OnlyOwnerCanListItems()");
    });

    it("checks if the listing was deleted", async () => {
      await BasicNFT.connect(nftOwner).approve(
        NFTMarketPlaceAddress,
        tokenId
      );

      let tx = await NFTMarketPlace.connect(nftOwner).listItem(
        BasicNFTAddress,
        tokenId,
        LISTING_PRICE
      );
      await tx.wait(1);

      let listedItem = await NFTMarketPlace.getListing(
        BasicNFTAddress,
        tokenId
      );

      expect(listedItem.seller).to.equal(nftOwner.address);
      tx = await NFTMarketPlace.connect(nftOwner).cancelListing(
        BasicNFTAddress,
        tokenId
      );
      await tx.wait(1);

      listedItem = await NFTMarketPlace.getListing(
        BasicNFTAddress,
        tokenId
      );

      expect(listedItem.seller).to.equal(NULL_ADDRESS);
    });

    it("checks if the deleting event was emitted", async () => {
      await BasicNFT.connect(nftOwner).approve(
        NFTMarketPlaceAddress,
        tokenId
      );

      let tx = await NFTMarketPlace.connect(nftOwner).listItem(
        BasicNFTAddress,
        tokenId,
        LISTING_PRICE
      );
      await tx.wait(1);

      tx = await NFTMarketPlace.connect(nftOwner).cancelListing(
        BasicNFTAddress,
        tokenId
      );
      await tx.wait(1);

      const events = await NFTMarketPlace.queryFilter("ListingDeleted");
      expect(events[0].args.nftAddress).to.equal(BasicNFTAddress);
      expect(events[0].args.tokenId).to.equal(tokenId);
    });
  });
});
