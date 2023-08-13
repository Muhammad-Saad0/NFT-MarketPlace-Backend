const networkConfig = {
  default: {
    name: "hardhat",
    fee: "100000000000000000",
    keyHash:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000",
    automationUpdateInterval: "30",
    callBackGasLimit: 500000,
  },
  31337: {
    name: "localhost",
    fee: "100000000000000000",
    keyHash:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000",
    automationUpdateInterval: "30",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    callBackGasLimit: 500000,
  },
  11155111: {
    name: "sepolia",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    keyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    vrfWrapper: "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",
    oracle: "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD",
    jobId: "ca98366cc7314957b8c012c72f05aeeb",
    subscriptionId: "777",
    fee: "100000000000000000",
    fundAmount: "100000000000000000", // 0.1
    automationUpdateInterval: "30",
    callbackGasLimit: 500000,
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

const FRONTEND_CONTRACT_ADDRESSES_FILE =
  "../../front-end/constants/contractAddresses.json";
const FRONTEND_ABI_FILE = "../../front-end/constants/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  FRONTEND_ABI_FILE,
  FRONTEND_CONTRACT_ADDRESSES_FILE,
};
