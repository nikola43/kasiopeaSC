
import { ethers } from 'hardhat'
import { formatEther } from 'ethers/lib/utils';

import test_util from '../test/util'
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')
const colors = require('colors/safe');
async function main() {
    const [deployer] = await ethers.getSigners()
    if (deployer === undefined) throw new Error('Deployer is undefined.')
    console.log(colors.cyan('Deployer Address: ') + colors.yellow(deployer.address));
    console.log(colors.cyan('Account balance: ') + colors.yellow(formatEther(await deployer.getBalance())));
    console.log();

    const contractName = "CronusTimeKeeper";

    const args = [
        "0xA1DF97bD39065Ecd084619a0B9d46853dfA722Aa"
    ];
    const contract = await test_util.deployProxyV2(contractName, false, args);
    const contractImpl = await getImplementationAddress(
        ethers.provider,
        contract.address
    )

    console.log("");
    console.log(colors.green('Deploy Successfully!'));
    console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(contract.address)}`)
    console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(contractImpl)}`)
    console.log("");

    await test_util.verify(contractImpl, contractName)
    return true;
}


main()
    .then(async (r: any) => {
        console.log("");
        return r;
    })
    .catch(error => {
        console.log(colors.red("ERROR :("));
        console.log(colors.red(error));
        return undefined;
    })
