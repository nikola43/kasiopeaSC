import { ethers } from 'hardhat'
import { ExecException } from 'child_process'
import { formatEther } from 'ethers/lib/utils';
//import test_util from './util'
const colors = require('colors/safe');
async function main() {
    const [deployer] = await ethers.getSigners()
    if (deployer === undefined) throw new Error('Deployer is undefined.')
    console.log(colors.cyan('Deployer Address: ') + colors.yellow(deployer.address));
    console.log(colors.cyan('Account balance: ') + colors.yellow(formatEther(await deployer.getBalance())));
    console.log();

    const tokenFactory = await ethers.getContractFactory("MyToken");
    const token = await tokenFactory.deploy();
    await token.deployed();
    console.log("Deploying upgradeable contract of MidasHands...");
    console.log("Deployed", token.address);

    // await test_util.verify(MidasHands_Deployed.address, args)
    return {
        TokenAddress: token.address
    }
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string) {
    const exec = require('child_process').exec
    return new Promise((resolve) => {
        exec(cmd, (error: ExecException, stdout: string, stderr: string) => {
            if (error) {
                console.warn(error)
            }
            resolve(stdout ? stdout : stderr)
        })
    })
}

main()
    .then(async (r: any) => {
        console.log("");
        console.log(colors.green('Deploy Successfully!'));
        console.log("");
        console.log(`${colors.cyan('Token Address: ')} ${colors.yellow(r.TokenAddress)}`)

        console.log("");
        await execShellCommand("sleep 5");
        const command = "npx hardhat verify " + r.TokenAddress + " --network bsctestnet";
        console.log(colors.cyan('Run: '));
        console.log("");
        console.log(colors.yellow(command));
        console.log("");
        console.log(colors.cyan("For ") + colors.green("verify") + colors.cyan(" your contract"));
        return r;
    })
    .catch(error => {
        console.log(colors.red("ERROR :("));
        console.log(colors.red(error));
        return undefined;
    })