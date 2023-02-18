const { networkConfig } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // let ethUsdPriceFeedAddress = networkConfig[chainId]?.["ethUsdPriceFeed"];
  // if (!ethUsdPriceFeedAddress) {
  //   const mockV3Aggregator = await get("MockV3Aggregator");
  //   ethUsdPriceFeedAddress = mockV3Aggregator.address;
  // }

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const mockV3Aggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = mockV3Aggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmation: network.config.blockConfirmations,
  });
  console.log(fundMe);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports.tags = ["all", "fundMe"];
