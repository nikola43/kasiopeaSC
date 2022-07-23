import { ethers, upgrades } from "hardhat";
const util = require("./util");
const { parseEther } = ethers.utils;
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
const colors = require("colors");
const os = require("os");
import { expect } from "chai";
import { formatEther } from "ethers/lib/utils";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

//available functions
describe("Token contract", async () => {
  let tokenDeployed: Contract;
  let router: Contract;
  let pairContract: Contract;
  let tykheContract: Contract;
  let tykheContractImplementationAddress: string;
  let deployer: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  let rose: SignerWithAddress;
  let john: SignerWithAddress;
  let lisa: SignerWithAddress;

  it("1. Get Signer", async () => {
    const signers = await ethers.getSigners();
    if (signers[0] !== undefined) {
      deployer = signers[0];
      console.log(
        `${colors.cyan("Deployer Address")}: ${colors.yellow(
          deployer?.address
        )}`
      );
    }
    if (signers[1] !== undefined) {
      bob = signers[1];
      console.log(
        `${colors.cyan("Bob Address")}: ${colors.yellow(bob?.address)}`
      );
    }
    if (signers[2] !== undefined) {
      alice = signers[2];
      console.log(
        `${colors.cyan("Alice Address")}: ${colors.yellow(alice?.address)}`
      );
    }
    if (signers[3] !== undefined) {
      rose = signers[3];
      console.log(
        `${colors.cyan("Rose Address")}: ${colors.yellow(rose?.address)}`
      );
    }
    if (signers[4] !== undefined) {
      john = signers[4];
      console.log(
        `${colors.cyan("John Address")}: ${colors.yellow(john?.address)}`
      );
    }
    if (signers[5] !== undefined) {
      lisa = signers[5];
      console.log(
        `${colors.cyan("Lisa Address")}: ${colors.yellow(lisa?.address)}`
      );
    }
  });

  it("2. Deploy Contract", async () => {
    // INSTANCE CONTRACT
    router = await util.connectRouter();
    //const routerFactory = await util.connectFactory()
    //const bnbContract = await util.connectWBNB()
    //const busdContract = await util.connectBUSD()

    // DEPLOY
    const contractName = "MyToken";
    const tokenFactory = await ethers.getContractFactory(contractName);
    tokenDeployed = await tokenFactory.deploy();
    await tokenDeployed.deployed();
  });

  it("3. Add Liquidity", async () => {
    await tokenDeployed.approve(
      util.chains.bsc.router,
      ethers.constants.MaxUint256,
      { from: deployer?.address }
    );
    const tx = await router.connect(deployer).addLiquidityETH(
      tokenDeployed.address,
      parseEther("60000000"),
      parseEther("60000000"),
      parseEther("100"),
      deployer?.address,
      2648069985, // Saturday, 29 November 2053 22:59:45
      {
        value: parseEther("100"),
      }
    );
    console.log(`${colors.cyan("TX")}: ${colors.yellow(tx.hash)}`);
    console.log();

    const routerFactory = await util.connectFactory();
    const pairAddress = await routerFactory.getPair(
      util.chains.bsc.wChainCoin,
      tokenDeployed.address
    );
    pairContract = await util.connectPair(pairAddress);
    console.log(
      `${colors.cyan("LP Address")}: ${colors.yellow(pairContract?.address)}`
    );
    console.log(
      `${colors.cyan("LP Balance")}: ${colors.yellow(
        formatEther(await pairContract.balanceOf(deployer?.address))
      )}`
    );
    expect(1).to.be.eq(1);
    console.log();
  });

  it("4. Enable trading", async () => {
    await tokenDeployed.enableTrading();
    console.log();
  });

  it("5. Transfer From Owner To Bob ", async () => {
    await tokenDeployed.transfer(bob.address, parseEther("1000"));
    expect(await tokenDeployed.balanceOf(bob?.address)).to.be.eq(
      parseEther("1000")
    );
    console.log();
  });

  it("6. Transfer From Bob To Alice ", async () => {
    await tokenDeployed
      .connect(bob)
      .transfer(alice?.address, parseEther("100"));
    expect(await tokenDeployed.balanceOf(alice?.address)).to.be.eq(
      parseEther("100")
    );
    console.log();
  });

  it("7. Buy Bob", async () => {
    console.log();
    //--- BUY
    console.log(
      `${colors.cyan("Contract token Balance Before Swap")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tokenDeployed.address))
      )}`
    );
    await util.swapExactETHForTokens(
      tokenDeployed.address,
      router,
      bob,
      parseEther("1.2")
    );
    console.log(
      `${colors.cyan("Bob token Balance After Swap")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(bob?.address))
      )}`
    );
    console.log(
      `${colors.cyan("Contract token Balance After")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tokenDeployed.address))
      )}`
    );
    console.log();
  });

  it("8. Sell Bob", async () => {
    //--- SELL
    //await util.swapExactTokensForETH(tokenDeployed.address, router, bob, parseEther("1000")); // 100 tokens

    await tokenDeployed.connect(bob).approve(router.address, parseEther("100"));
    await util.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      tokenDeployed.address,
      router,
      bob,
      parseEther("100")
    ); // 100 tokens
    console.log(
      `${colors.cyan("Bob token Balance")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(bob?.address))
      )}`
    );
    console.log(
      `${colors.cyan("Contract token Balance After")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tokenDeployed.address))
      )}`
    );
    console.log();
  });

  it("9. Deploy Tykhey", async () => {
    console.log("");
    // DEPLOY
    const contractName = "TykheFortuneDistributor";
    const contractFactory = await ethers.getContractFactory(contractName);
    tykheContract = await upgrades.deployProxy(contractFactory, []);
    await tykheContract.deployed();
    tykheContractImplementationAddress = await getImplementationAddress(
      ethers.provider,
      tykheContract.address
    );

    console.log(
      `${colors.cyan(contractName + " Proxy Address: ")} ${colors.yellow(
        tykheContract.address
      )}`
    );
    console.log(
      `${colors.cyan(
        contractName + " Implementation Address: "
      )} ${colors.yellow(tykheContractImplementationAddress)}`
    );
    console.log("");

    await tokenDeployed
      .connect(deployer)
      .transfer(tykheContract.address, parseEther("75"));

    console.log(
      `${colors.cyan("TykheContract token Balance")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tykheContract.address))
      )}`
    );
  });

  describe("10. Config Tykhe", async () => {
    it("10.1 - Set Fee Token Address", async () => {
      await tykheContract
        .connect(deployer)
        .setSendFeeTokenAddress(tokenDeployed.address);
      await sleep(1000);
    });
    it("10.2 - Approve to send tokens", async () => {
      await tykheContract
        .connect(deployer)
        .approve(util.chains.bsc.router, ethers.constants.MaxUint256, {
          from: deployer?.address,
        });
      await sleep(1000);
    });
    it("10.3 - Check Fee Token Address", async () => {
      await tykheContract.connect(deployer).getSendFeeTokenAddress();
      await sleep(1000);
      //   console.log({res})
      //   expect(res).to.be.eq(tokenDeployed.address);
    });
    it("10.4 - Set Fortune Receivers", async () => {
      const receivers = [
        bob.address,
        alice.address,
        rose.address,
        john.address,
      ];
      const percent = [2000, 5000, 1700, 1300];
      await tykheContract
        .connect(deployer)
        .addFortuneReceivers(receivers, percent);
      await sleep(1000);
    });
    it("10.5 - Check Fortune Receivers", async () => {
      await tykheContract.connect(deployer).getMembersCounter();
    });

    it("10.6 - Check Balances Before", async () => {
      const contractBalance = await tokenDeployed.balanceOf(
        tykheContract.address
      );
      console.log(
        `${colors.cyan(
          "Contract Balance Before distribution: "
        )} ${colors.yellow(formatEther(contractBalance))}`
      );

      const bobBalance = await tokenDeployed.balanceOf(bob?.address);
      console.log(
        `${colors.cyan("Bob Balance Before distribution: ")} ${colors.yellow(
          formatEther(bobBalance)
        )}`
      );

      const aliceBalance = await tokenDeployed.balanceOf(alice?.address);
      console.log(
        `${colors.cyan("Alice Balance Before distribution: ")} ${colors.yellow(
          formatEther(aliceBalance)
        )}`
      );

      const roseBalance = await tokenDeployed.balanceOf(rose?.address);
      console.log(
        `${colors.cyan("Rose Balance Before distribution: ")} ${colors.yellow(
          formatEther(roseBalance)
        )}`
      );

      const johnBalance = await tokenDeployed.balanceOf(john?.address);
      console.log(
        `${colors.cyan("John Balance Before distribution: ")} ${colors.yellow(
          formatEther(johnBalance)
        )}`
      );

      const lisaBalance = await tokenDeployed.balanceOf(lisa?.address);
      console.log(
        `${colors.cyan("Lise Balance Before distribution: ")} ${colors.yellow(
          formatEther(lisaBalance)
        )}`
      );
    });
    it("10.7 - Send Tokens Fortune", async () => {
      await tykheContract
        .connect(deployer)
        .sendTokensFortune(tokenDeployed.address);
      await sleep(1000);
    });
    it("10.8 - Check Balances After", async () => {
      const contractBalance = await tokenDeployed.balanceOf(
        tykheContract.address
      );
      console.log(
        `${colors.cyan(
          "Contract Balance  after distribution: "
        )} ${colors.yellow(formatEther(contractBalance))}`
      );
      const bobBalance = await tokenDeployed.balanceOf(bob?.address);
      console.log(
        `${colors.cyan("Bob Balance  after distribution: ")} ${colors.yellow(
          formatEther(bobBalance)
        )}`
      );

      const aliceBalance = await tokenDeployed.balanceOf(alice?.address);
      console.log(
        `${colors.cyan("Alice Balance after distribution: ")} ${colors.yellow(
          formatEther(aliceBalance)
        )}`
      );

      const roseBalance = await tokenDeployed.balanceOf(rose?.address);
      console.log(
        `${colors.cyan("Rose Balance after distribution: ")} ${colors.yellow(
          formatEther(roseBalance)
        )}`
      );

      const johnBalance = await tokenDeployed.balanceOf(john?.address);
      console.log(
        `${colors.cyan("John Balance after distribution: ")} ${colors.yellow(
          formatEther(johnBalance)
        )}`
      );

      const lisaBalance = await tokenDeployed.balanceOf(lisa?.address);
      console.log(
        `${colors.cyan("Lise Balance after distribution: ")} ${colors.yellow(
          formatEther(lisaBalance)
        )}`
      );
    });
    it("10.9 - Update Fortune Receibers percentage", async () => {
      await tykheContract
      .connect(alice)
      .updateFortuneReceiverPercentage(alice.address, 4000)
      await sleep(1000);
    });
    it("10.10 - Update Fortune Receibers percentage and fail", async () => {
      await expect(
        await tykheContract
          .connect(deployer)
          .updateFortuneReceiverPercentage(alice.address, 4000)
      ).to.be.revertedWith('Receiver is not msg.sender');
      await sleep(1000);
    });
  });


});

export const sleep = async (ms: number, message: string = "") => {
  let command = "sleep";
  if (os.platform() === "linux") {
    command = "sleep";
  }

  console.log();
  const s = ms / 1000;

  if (message.length > 0) {
    console.log(command + " ", s.toString(), " seconds\n");
  }

  console.log(command + " ", s.toString(), " seconds\n");
  await execShellCommand(command + " " + s.toString());
  console.log("awake");
  console.log();
};

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string) {
  const exec = require("child_process").exec;
  return new Promise((resolve) => {
    exec(cmd, (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}
