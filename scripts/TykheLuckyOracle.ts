import { ethers } from "hardhat";
import { formatEther } from "ethers/lib/utils";
const colors = require("colors/safe");
async function main() {
  const [deployer] = await ethers.getSigners();
  if (deployer === undefined) throw new Error("Deployer is undefined.");
  console.log(
    colors.cyan("Deployer Address: ") + colors.yellow(deployer.address)
  );
  console.log(
    colors.cyan("Account balance: ") +
    colors.yellow(formatEther(await deployer.getBalance()))
  );
  console.log();
  console.log(
    colors.cyan("Deploying TykheLuckyOracle")
  );
  console.log();

  const contractName = "TykheLuckyOracle";

  const contractFactory = await ethers.getContractFactory(contractName);
  const tykheLuckyOracle = await contractFactory.deploy("0xc587d9053cd1118f25F645F9E08BB98c9712A4EE",
    "0x404460C6A5EdE2D891e8297795264fDe62ADBB75",
    "0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04");
  await tykheLuckyOracle.deployed()

  console.log("");
  console.log(colors.green("Deploy Successfully!"));
  console.log(
    `${colors.cyan(contractName + " Proxy Address: ")} ${colors.yellow(
      tykheLuckyOracle.address
    )}`
  );

  return true;
}

main()
  .then(async (r: any) => {
    console.log("");
    return r;
  })
  .catch((error) => {
    console.log(colors.red("ERROR :("));
    console.log(colors.red(error));
    return undefined;
  });
