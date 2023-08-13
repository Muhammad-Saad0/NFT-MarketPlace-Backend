module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [];

  console.log("-------------------------\ndeploying NFTMarketPlace...");
  const NFTMarketPlace = await deploy("NFTMarketPlace", {
    from: deployer,
    log: true,
    args: args,
  });
  console.log("NFTMarketPlace deployed.\n-------------------------");
};

module.exports.tags = ["all", "NFTMarketPlace"];
