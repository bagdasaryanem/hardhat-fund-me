const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe;
      let mockV3Aggregator;
      let deployer;
      const oneEther = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async () => {
        it("it sets the aggregator address correctly", async () => {
          const response = await fundMe.s_priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", () => {
        it("should throw error when value is not enough", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("updated the s_addressToAmountFunded", async () => {
          await fundMe.fund({ value: oneEther });
          const value = await fundMe.s_addressToAmountFunded(deployer);
          assert.equal(value.toString(), oneEther.toString());
        });

        it("updated s_funders array", async () => {
          await fundMe.fund({ value: oneEther });
          const funder = await fundMe.s_funders(0);
          assert.equal(deployer, funder);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: oneEther });
        });
        it("withraws ETH from a founder", async () => {
          //arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          console.log(
            "🚀 ~ file: FundMe.test.js:51 ~ it ~ startingFundMeBalance",
            startingFundMeBalance.toString()
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            "🚀 ~ file: FundMe.test.js:55 ~ it ~ startingDeployerBalance",
            startingDeployerBalance.toString()
          );
          //act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //assert
          const x = endingDeployerBalance.add(gasCost);
          console.log("🚀 ~ file: FundMe.test.js:67 ~ it ~ x", x.toString());
          const y = x.add(endingFundMeBalance);
          console.log("🚀 ~ file: FundMe.test.js:69 ~ it ~ y", y.toString());
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            y.toString()
          );
        });

        it("withdraws correctly when funding from multiple users", async () => {
          //arrange
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 6; i++) {
            const connectedFundMe = await fundMe.connect(accounts[i]);

            await connectedFundMe.fund({ value: oneEther });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //assert
          const x = endingDeployerBalance.add(gasCost);
          console.log("🚀 ~ file: FundMe.test.js:67 ~ it ~ x", x.toString());
          const y = x.add(endingFundMeBalance);
          console.log("🚀 ~ file: FundMe.test.js:69 ~ it ~ y", y.toString());
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            y.toString()
          );

          //make sure s_funders are reset properly
          await expect(fundMe.s_funders(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.s_addressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("only allows withdraw for deployer", async () => {
          const attackers = await ethers.getSigners();
          const attackerFundMeConnected = await fundMe.connect(attackers[1]);

          await expect(attackerFundMeConnected.withdraw()).to.be.reverted;
          // try {
          //   await attackerFundMeConnected.withdraw();
          // } catch (e) {
          //   console.log("EEEEERRRR", e.message);
          // }
        });
      });

      describe("cheaperWithdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: oneEther });
        });
        it("withraws ETH from a founder", async () => {
          //arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          console.log(
            "🚀 ~ file: FundMe.test.js:51 ~ it ~ startingFundMeBalance",
            startingFundMeBalance.toString()
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            "🚀 ~ file: FundMe.test.js:55 ~ it ~ startingDeployerBalance",
            startingDeployerBalance.toString()
          );
          //act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //assert
          const x = endingDeployerBalance.add(gasCost);
          console.log("🚀 ~ file: FundMe.test.js:67 ~ it ~ x", x.toString());
          const y = x.add(endingFundMeBalance);
          console.log("🚀 ~ file: FundMe.test.js:69 ~ it ~ y", y.toString());
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            y.toString()
          );
        });

        it("withdraws correctly when funding from multiple users", async () => {
          //arrange
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 6; i++) {
            const connectedFundMe = await fundMe.connect(accounts[i]);

            await connectedFundMe.fund({ value: oneEther });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log("SSSSSSSS");
          //act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //assert
          const x = endingDeployerBalance.add(gasCost);
          console.log("🚀 ~ file: FundMe.test.js:67 ~ it ~ x", x.toString());
          const y = x.add(endingFundMeBalance);
          console.log("🚀 ~ file: FundMe.test.js:69 ~ it ~ y", y.toString());
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            y.toString()
          );

          //make sure s_funders are reset properly
          await expect(fundMe.s_funders(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.s_addressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("only allows withdraw for deployer", async () => {
          const attackers = await ethers.getSigners();
          const attackerFundMeConnected = await fundMe.connect(attackers[1]);

          await expect(attackerFundMeConnected.cheaperWithdraw()).to.be
            .reverted;
        });
      });
    });
