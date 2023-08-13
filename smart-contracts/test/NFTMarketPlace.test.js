const { ethers, deployments, getNamedAccounts } = require("hardhat");

describe("unit testing", () => {
  let deployer, NFTMarketPlace, BasicNFT;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);

    NFTMarketPlace = await ethers.getContract("NFTMarketPlace");
    BasicNFT = await ethers.getContract("BasicNFT");
  });

  describe("testing NFTMarketPlace", () => {
    it("does something", async () => {
      console.log("helloo...");
    });
  });
});
