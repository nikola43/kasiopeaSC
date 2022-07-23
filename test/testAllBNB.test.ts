import { ethers, upgrades } from 'hardhat'
const colors = require('colors');
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core'
import { parseEther, formatEther } from 'ethers/lib/utils';
import { expect } from 'chai';
const os = require('os')
const util = require('./util');

// const toTimestamp = (date: string) =>
//   date == undefined ? new Date().getTime() : new Date(date).getTime() / 1000
/*
const setBlockTime = async (date: string) => {
    await network.provider.send('evm_setNextBlockTimestamp', [
        date == undefined ? new Date().getTime() : new Date(date).getTime() / 1000
    ])
    await network.provider.send('evm_mine')
}
*/

describe("Meta Testing", async () => {

    const deployedContracts: any = [

    ]

    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    let router: Contract;

    let metaCompany: Contract;
    let metaCompanyImplementationAddress: string;


    let metaFranchise: Contract;
    let metaFranchiseImplementationAddress: string;


    let metaCompanyManager: Contract;
    let metaCompanyManagerImplementationAddress: string;

    let metaFranchiseManager: Contract;
    let metaFranchiseManagerImplementationAddress: string;

    describe("1 - Deploy MetaStock Contracts", async () => {

        it("1.1 - Get Signer", async () => {
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

            router = await util.connectRouter()
            console.log("router:", router.address);
        });

        it("1.3 - Deploy MetaCompany", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaCompany'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaCompany = await upgrades.deployProxy(contractFactory)
            await metaCompany.deployed()
            metaCompanyImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaCompany.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaCompany.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaCompanyImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaCompany.address
                }
            })
        });


        it("1.4 - Deploy MetaFranchise", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaFranchise'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaFranchise = await upgrades.deployProxy(contractFactory)
            await metaFranchise.deployed()
            metaFranchiseImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaFranchise.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaFranchise.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaFranchiseImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaFranchise.address
                }
            })
        });
    });

    describe("2.0 - Deploy Deploy MetaStock Contract Managers", async () => {


        it("2.3 - Deploy MetaFranchiseManager", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaFranchiseManager'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaFranchiseManager = await upgrades.deployProxy(contractFactory, [metaFranchise.address])
            await metaFranchiseManager.deployed()
            metaFranchiseManagerImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaFranchise.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaFranchiseManager.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaFranchiseManagerImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaFranchiseManager.address
                }
            })
        });

        it("2.1 - Deploy MetaCompanyManager", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaCompanyManager'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaCompanyManager = await upgrades.deployProxy(contractFactory, [metaCompany.address, metaFranchiseManager.address])
            await metaCompanyManager.deployed()
            metaCompanyManagerImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaCompanyManager.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaCompanyManager.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaCompanyManagerImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaCompanyManager.address
                }
            })
        });



    });

    describe("3.0 - Transfer Ownerships", async () => {

        it("3.1 - Transfer Ownership MetastockCompany -> MetaCompanyManager", async () => {
            await metaCompany.transferOwnership(metaCompanyManager.address);
        })

        it("3.2 - Transfer Ownership MetaFranchise -> MetaFranchiseManager", async () => {
            await metaFranchise.transferOwnership(metaFranchiseManager.address);
        })
    })



    describe("5.0 - Config contract", async () => {



        it("5.3 - Create createCompany", async () => {
            await metaCompanyManager.connect(bob).createCompany(bob.address);
            await sleep(2000)
        })


        it("5.4 - Create MetaFranchise", async () => {
            const priceBNB = await metaCompanyManager.getCreateFranchisePriceBNB();
            console.log(`${colors.cyan("Create price: ")} ${colors.yellow(formatEther(priceBNB))}`)
            const number = 2;
            await metaCompanyManager.connect(bob).createMetaFranchiseUsingBNB(number, { value: parseEther('0.06') });
            await sleep(2000)
            const franchisesNumber = await metaCompanyManager.connect(bob).getNumberOfMetaFranchises(bob.address)

            const getMetaFranchisesUnclaimedRewards = await metaCompanyManager.connect(bob).getMetaFranchisesUnclaimedRewardsBNB(bob.address)
            console.log(`${colors.cyan("getMetaFranchisesUnclaimedRewardsBNB : ")} ${colors.yellow(formatEther(getMetaFranchisesUnclaimedRewards))}`)


            expect(franchisesNumber).to.be.eq(2);
            const isCeo = await metaCompanyManager.isCeo(bob.address);
            console.log(`${colors.cyan("isCeo: ")} ${colors.yellow(isCeo)}`)

            const companyId = await metaCompanyManager.getCompanyId(bob.address);
            console.log(`${colors.cyan("CompanyId: ")} ${colors.yellow(companyId)}`)

            let companyCeoAddress = await metaCompanyManager.getCompanyCEOAddress(companyId);
            console.log(`${colors.cyan("CompanyCEOAddress: ")} ${colors.yellow(companyCeoAddress)}`)
            await metaCompanyManager.connect(bob).claimFromAllFranchisesBNB()
        })

        it("5.5 - Claim From All Franchises", async () => {
            const companyId = await metaCompanyManager.getCompanyId(bob.address);
            console.log(`${colors.cyan("companyId: ")} ${colors.yellow(formatEther(companyId))}`)

            await sleep(15000)
            //const bobBalance = await metaToken.balanceOf(bob?.address);
            //console.log(`${colors.cyan("Bob Balance Before Claim: ")} ${colors.yellow(formatEther(bobBalance))}`)

            const getMetaFranchisesUnclaimedRewards = await metaCompanyManager.connect(bob).getMetaFranchisesUnclaimedRewardsBNB(bob.address)
            console.log(`${colors.cyan("getMetaFranchisesUnclaimedRewardsBNB : ")} ${colors.yellow(formatEther(getMetaFranchisesUnclaimedRewards))}`)

            await metaCompanyManager.connect(bob).claimFromAllFranchisesBNB()

            //const bobBalanceAfter = await metaToken.balanceOf(bob?.address);
            //console.log(`${colors.cyan("Bob Balance After Claim: ")} ${colors.yellow(formatEther(bobBalanceAfter))}`)
        })
    });

    /*
    describe("6.0 - Test claim changing the current day", async () => {
        it("6.2 - Change to 16 of July", async () => {
            setBlockTime('2022-07-16')
        });
        it("6.3 - Create two nodes", async () => {
            const priceBNB = await metaCompanyManager.getCreateFranchisePriceBNB();
            console.log(`${colors.cyan("Create price: ")} ${colors.yellow(formatEther(priceBNB))}`)
            const number = 1;
            await metaCompanyManager.connect(alice).createMetaFranchiseUsingBNB(number, { value: parseEther('0.03') });
            await sleep(2000)
            const franchisesNumber = await metaCompanyManager.connect(alice).getNumberOfMetaFranchises(alice.address)
            expect(franchisesNumber).to.be.eq(1);
        });
        it("6.4 - Change to 17 of July", async () => {
            setBlockTime('2022-07-17')
        });
        it("6.5 - Test claimable and claim", async () => {
            const getMetaFranchisesUnclaimedRewards = await metaCompanyManager.connect(alice).getMetaFranchisesUnclaimedRewardsBNB(alice.address)
            console.log(`${colors.cyan("getMetaFranchisesUnclaimedRewardsBNB : ")} ${colors.yellow(formatEther(getMetaFranchisesUnclaimedRewards))}`)
            await metaCompanyManager.connect(alice).claimFromAllFranchisesBNB()
        });
        it("6.6 - Test claimable after claim", async () => {
            const getMetaFranchisesUnclaimedRewards = await metaCompanyManager.connect(alice).getMetaFranchisesUnclaimedRewardsBNB(alice.address)
            console.log(`${colors.cyan("getMetaFranchisesUnclaimedRewardsBNB : ")} ${colors.yellow(formatEther(getMetaFranchisesUnclaimedRewards))}`)
        });
    })
    */

});

export const sleep = async (ms: number, message: string = "") => {
    let command = 'sleep'
    if (os.platform() === 'linux') {
        command = 'sleep'
    }

    console.log()
    const s = ms / 1000

    if (message.length > 0) {
        console.log(command + ' ', s.toString(), ' seconds\n')
    }

    console.log(command + ' ', s.toString(), ' seconds\n')
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
