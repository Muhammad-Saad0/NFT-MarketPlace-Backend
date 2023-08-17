const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

const LISTING_PRICE = ethers.utils.parseEther("1");
const NEW_LISTING_PRICE = ethers.utils.parseEther("2");
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("testing NFTMarketPlace", () => {
  let deployer,
    NFTMarketPlace,
    BasicNFT,
    user,
    tokenId,
    nftOwner,
    sellerStartingBalance;
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

    sellerStartingBalance = await ethers.provider.getBalance(
      nftOwner.address
    );
  });
  const buyNFT = () => {
    return new Promise(async (resolve, reject) => {
      try {
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

        tx = await NFTMarketPlace.connect(user).buyItem(
          BasicNFTAddress,
          tokenId,
          {
            value: ethers.utils.parseEther("1"),
          }
        );
        await tx.wait(1);
        resolve();
      } catch (error) {
        reject();
      }
    });
  };

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

  describe("testing update listing", async () => {
    beforeEach(async () => {
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
    });

    it("reverts if the price is too low", async () => {
      await expect(
        NFTMarketPlace.connect(nftOwner).updateListing(
          BasicNFTAddress,
          tokenId,
          ethers.utils.parseEther("0")
        )
      ).to.be.revertedWith("PriceTooLow()");
    });

    it("reverts if the request sender is not owner", async () => {
      await expect(
        NFTMarketPlace.connect(user).updateListing(
          BasicNFTAddress,
          tokenId,
          ethers.utils.parseEther("0")
        )
      ).to.be.reverted;
    });

    it("updates the listing", async () => {
      let tx = await NFTMarketPlace.connect(nftOwner).updateListing(
        BasicNFTAddress,
        tokenId,
        NEW_LISTING_PRICE
      );
      await tx.wait(1);

      const listedItem = await NFTMarketPlace.getListing(
        BasicNFTAddress,
        tokenId
      );

      expect(listedItem.price).to.equal(NEW_LISTING_PRICE);
    });

    it("checks if the event was emitted", async () => {
      let tx = await NFTMarketPlace.connect(nftOwner).updateListing(
        BasicNFTAddress,
        tokenId,
        NEW_LISTING_PRICE
      );
      await tx.wait(1);

      const events = await NFTMarketPlace.queryFilter("ItemListed");
      expect(events[1].args.price).to.equal(NEW_LISTING_PRICE);
    });
  });

  describe("testing buyItem", () => {
    it("reverts if the NFT is not Listed", async () => {
      await expect(
        NFTMarketPlace.buyItem(BasicNFTAddress, tokenId)
      ).to.be.revertedWith("NotListed");
    });

    it("reverts if the price is not met", async () => {
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
        NFTMarketPlace.buyItem(BasicNFTAddress, tokenId, {
          value: ethers.utils.parseEther("0.5"),
        })
      ).to.be.revertedWith("PriceNotMet");
    });

    it("updates the proceedings", async () => {
      await buyNFT();
      const response = await NFTMarketPlace.getProceeds(nftOwner.address);
      expect(response).to.equal(LISTING_PRICE);
    });

    it("checks if NFT was transfered", async () => {
      await buyNFT();
      const newOwner = await BasicNFT.ownerOf(tokenId);
      expect(newOwner).to.equal(user.address);
    });

    it("checks if itemBought event was emitted", async () => {
      await buyNFT();
      const events = await NFTMarketPlace.queryFilter("Itembought");
      const buyer = events[0].args.buyer;
      expect(buyer).to.equal(user.address);
    });
  });

  describe("testing withdraw proceedings", () => {
    it("reverts if there are no proceedings", async () => {
      await expect(
        NFTMarketPlace.connect(nftOwner).withdrawProceeds()
      ).to.be.revertedWith(`NoProceeds("${nftOwner.address}")`);
    });

    it("checks if the proceeds were cleared", async () => {
      await buyNFT();
      const tx = await NFTMarketPlace.connect(nftOwner).withdrawProceeds();
      await tx.wait(1);

      const response = await NFTMarketPlace.getProceeds(nftOwner.address);
      expect(response.toString()).to.equal("0");
    });

    it("checks if the balance of seller was increased", async () => {
      await buyNFT();
      const tx = await NFTMarketPlace.connect(nftOwner).withdrawProceeds();
      await tx.wait(1);

      const balance = await ethers.provider.getBalance(nftOwner.address);
      expect(balance).to.above(sellerStartingBalance);
    });
  });
});
