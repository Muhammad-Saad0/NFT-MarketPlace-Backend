module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [];

  console.log("-------------------------\ndeploying BasicNFT...");
  await deploy("BasicNFT", {
    from: deployer,
    log: true,
    args: args,
  });
  console.log("BasicNFT deployed.\n-------------------------");
};

module.exports.tags = ["all", "mocks"];
