const { assert } = require("chai");
const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe;
      let deployer;
      const oneEth = ethers.utils.parseEther("0.1");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("lets fund and withdraw", async () => {
        await fundMe.fund({ value: oneEth });
        await fundMe.withdraw();
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        assert.equal(endingFundMeBalance.toString(), "0");
      });
    });
