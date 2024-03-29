const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const deployer = await getNamedAccounts().deployer;
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Contract funding...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded");
}

main()
  .then(() => process.exit(0))
  .catch(() => {
    console.log(error);
    process.exit(1);
  });
