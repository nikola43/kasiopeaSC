const { ethers, upgrades } = require('hardhat')
const os = require('os')
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from '@ethersproject/contracts';
import { formatEther } from 'ethers/lib/utils';
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')
const colors = require('colors/safe');
import test_util from '../test/util'
async function main(): Promise<void> {

    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    let metaCompany: Contract;
    let metaCompanyImplementationAddress: string;

    let metaFranchise: Contract;
    let metaFranchiseImplementationAddress: string;

    let metaCompanyManager: Contract;
    let metaCompanyManagerImplementationAddress: string;

    let metaFranchiseManager: Contract;
    let metaFranchiseManagerImplementationAddress: string;


    console.log("");
    const signers = await ethers.getSigners();
    if (signers[0] !== undefined) {
        deployer = signers[0];
        console.log(`${colors.cyan('Deployer Address')}: ${colors.yellow(deployer?.address)}`)
    }
    if (signers[1] !== undefined) {
        bob = signers[1];
        console.log(`${colors.cyan('Bob Address')}: ${colors.yellow(bob?.address)}`)
    }
    if (signers[2] !== undefined) {
        alice = signers[2];
        console.log(`${colors.cyan('Alice Address')}: ${colors.yellow(alice?.address)}`)
    }
    console.log("");

    if (signers[0] != undefined) {

        deployer = signers[0];
        bob = signers[1];
        alice = signers[2];

        const verify = true;

        let initialBalance = formatEther(await deployer.getBalance());
        console.log(colors.cyan('Deployer Address: ') + colors.yellow(deployer.address));
        console.log(colors.cyan('Account balance: ') + colors.yellow(initialBalance));
        console.log();

        // 2
        let contractName = 'MetaCompany'
        let contractFactory = await ethers.getContractFactory(contractName)
        metaCompany = await upgrades.deployProxy(contractFactory)
        await metaCompany.deployed()
        metaCompanyImplementationAddress = await getImplementationAddress(
            ethers.provider,
            metaCompany.address
        )

        console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaCompany.address)}`)
        console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaCompanyImplementationAddress)}`)
        console.log("");
        await test_util.updateABI(contractName)
        if (verify) {
            await test_util.verifyWithotDeploy(contractName, metaCompany);
        }



        // 3
        contractName = 'MetaFranchise'
        contractFactory = await ethers.getContractFactory(contractName)
        metaFranchise = await upgrades.deployProxy(contractFactory)
        await metaFranchise.deployed()
        metaFranchiseImplementationAddress = await getImplementationAddress(
            ethers.provider,
            metaFranchise.address
        )

        console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaFranchise.address)}`)
        console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaFranchiseImplementationAddress)}`)
        console.log("");
        await test_util.updateABI(contractName)
        if (verify) {
            await test_util.verifyWithotDeploy(contractName, metaFranchise);
        }


        // 4
        contractName = 'MetaFranchiseManager'
        contractFactory = await ethers.getContractFactory(contractName)
        metaFranchiseManager = await upgrades.deployProxy(contractFactory, [metaFranchise.address])
        await metaFranchiseManager.deployed()
        metaFranchiseManagerImplementationAddress = await getImplementationAddress(
            ethers.provider,
            metaFranchise.address
        )

        console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaFranchiseManager.address)}`)
        console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaFranchiseManagerImplementationAddress)}`)
        console.log("");
        await test_util.updateABI(contractName)
        if (verify) {
            await test_util.verifyWithotDeploy(contractName, metaFranchiseManager);
        }


        // 5
        // DEPLOY
        contractName = 'MetaCompanyManager'
        contractFactory = await ethers.getContractFactory(contractName)
        metaCompanyManager = await upgrades.deployProxy(contractFactory, [metaCompany.address, metaFranchiseManager.address])
        await metaCompanyManager.deployed()
        metaCompanyManagerImplementationAddress = await getImplementationAddress(
            ethers.provider,
            metaCompanyManager.address
        )

        console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaCompanyManager.address)}`)
        console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaCompanyManagerImplementationAddress)}`)
        console.log("");
        await test_util.updateABI(contractName)
        if (verify) {
            await test_util.verifyWithotDeploy(contractName, metaCompanyManager);
        }


        // 6
        console.log(`${colors.cyan('transferOwnership')}`)
        await metaCompany.connect(deployer).transferOwnership(metaCompanyManager.address);
        console.log(`${colors.cyan('transferOwnership')}`)
        await metaFranchise.connect(deployer).transferOwnership(metaFranchiseManager.address);

        console.log(`${colors.cyan('getCreateFranchisePriceBNB')}`)
        const priceBNB = await metaCompanyManager.getCreateFranchisePriceBNB();
        console.log(`${colors.cyan("Create price: ")} ${colors.yellow(formatEther(priceBNB))}`)

        initialBalance = formatEther(await deployer.getBalance());
        console.log(colors.cyan('Deployer Address: ') + colors.yellow(deployer.address));
        console.log(colors.cyan('Account balance: ') + colors.yellow(initialBalance));
        console.log();

        /*
        await metaCompanyManager.connect(bob).createMetaFranchiseUsingBNB({ value: parseEther('0.3') });
        await sleep(10000)

        const isCeo = await metaCompanyManager.isCeo(bob.address);
        console.log(`${colors.cyan("isCeo: ")} ${colors.yellow(isCeo)}`)

        const companyId = await metaCompanyManager.getCompanyId(bob.address);
        console.log(`${colors.cyan("CompanyId: ")} ${colors.yellow(companyId)}`)

        let companyCeoAddress = await metaCompanyManager.getCompanyCEOAddress(companyId);
        console.log(`${colors.cyan("CompanyCEOAddress: ")} ${colors.yellow(companyCeoAddress)}`)
        */


    }
};

export const sleep = async (ms: number) => {
    let command = 'sleep'
    if (os.platform() === 'linux') {
        command = 'sleep'
    }

    console.log()
    const s = ms / 1000
    console.log(command + ' ', s.toString(), ' seconds')
    await execShellCommand(command + ' ' + s.toString())
    console.log('awake')
    console.log()
}
/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string) {
    const exec = require('child_process').exec
    return new Promise((resolve) => {
        exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.warn(error)
            }
            resolve(stdout ? stdout : stderr)
        })
    })
}

main()
    .then(async (r: void) => {
        console.log("");
        console.log(colors.green('Deploy Successfully!'));
        console.log("");
        return r;
    })
    .catch(error => {
        console.error(error);
        return undefined;
    })