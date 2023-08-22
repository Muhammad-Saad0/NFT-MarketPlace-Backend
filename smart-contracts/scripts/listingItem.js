const { ethers } = require("hardhat");

const mintAndList = async () => {
  const accounts = await ethers.getSigners();
  const seller = accounts[0];
  const BasicNFT = await ethers.getContract("BasicNFT");
  let tx = await BasicNFT.connect(seller).mintNFT();
  await tx.wait(1);

  const NFT_ID = 3;

  const NFTMarketPlace = await ethers.getContract("NFTMarketPlace");
  tx = await BasicNFT.connect(seller).approve(
    NFTMarketPlace.address,
    NFT_ID
  );
  tx.wait(1);

  const BasicNFTAddress = BasicNFT.address;
  tx = await NFTMarketPlace.listItem(
    BasicNFTAddress,
    NFT_ID,
    ethers.utils.parseEther("0.1")
  );
};

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
