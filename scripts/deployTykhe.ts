const { ethers, upgrades } = require("hardhat");
const os = require("os");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "@ethersproject/contracts";
import { formatEther, parseEther } from "ethers/lib/utils";
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const colors = require("colors/safe");
//import test_util from "../test/util";
async function main(): Promise<void> {
  let tokenDeployed: Contract;
  let tykheContract: Contract;
  let tykheContractImplementationAddress: string;
  let deployer: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  let rose: SignerWithAddress;
  let john: SignerWithAddress;
  let lisa: SignerWithAddress;

  console.log("");
  const signers = await ethers.getSigners();
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
  console.log("");

  if (signers[0] != undefined) {
    deployer = signers[0];
    bob = signers[1];
    alice = signers[2];
    rose = signers[2];
    john = signers[2];
    lisa = signers[2];

    let initialBalance = formatEther(await deployer.getBalance());
    console.log(
      colors.cyan("Deployer Address: ") + colors.yellow(deployer.address)
    );
    console.log(
      colors.cyan("Account balance: ") + colors.yellow(initialBalance)
    );
    console.log();

    // INSTANCE CONTRACT
    //const routerFactory = await util.connectFactory()
    //const bnbContract = await util.connectWBNB()
    //const busdContract = await util.connectBUSD()

    // DEPLOY
    const contractName = "MyToken";
    const tokenFactory = await ethers.getContractFactory(contractName);
    tokenDeployed = await tokenFactory.deploy();
    await tokenDeployed.deployed();
    await sleep(10000);

    console.log(
      `${colors.cyan(contractName + " Proxy Address: ")} ${colors.yellow(
        tokenDeployed.address
      )}`
    );

    console.log("");
    // DEPLOY
    const contractName1 = "TykheFortuneDistributor";
    const contractFactory = await ethers.getContractFactory(contractName1);
    tykheContract = await upgrades.deployProxy(contractFactory, []);
    await tykheContract.deployed();
    tykheContractImplementationAddress = await getImplementationAddress(
      ethers.provider,
      tykheContract.address
    );
    await sleep(10000);
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
      .transfer(tykheContract.address, parseEther("675"));

    console.log(
      `${colors.cyan("TykheContract token Balance")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tykheContract.address))
      )}`
    );

    await tykheContract
      .connect(deployer)
      .setSendFeeTokenAddress(tokenDeployed.address);
    console.log(
      `${colors.cyan("Send feeTokenAddress")}: ${colors.yellow(
        formatEther(await tokenDeployed.balanceOf(tykheContract.address))
      )}`
    );
    await sleep(5000);

    const receivers = [bob.address, alice.address, rose.address, john.address];
    const percent = [2000, 5000, 1700, 1300];
    await tykheContract
      .connect(deployer)
      .addFortuneReceivers(receivers, percent);
    console.log(
      `${colors.cyan("Send feeTokenAddress")})}`
    );
    await sleep(5000);
  }
}

export const sleep = async (ms: number) => {
  let command = "sleep";
  if (os.platform() === "linux") {
    command = "sleep";
  }

  console.log();
  const s = ms / 1000;
  console.log(command + " ", s.toString(), " seconds");
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

main()
  .then(async (r: void) => {
    console.log("");
    console.log(colors.green("Deploy Successfully!"));
    console.log("");
    return r;
  })
  .catch((error) => {
    console.error(error);
    return undefined;
  });
