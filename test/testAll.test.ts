import { ethers, upgrades } from 'hardhat'
const colors = require('colors');
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core'
import { parseEther, formatEther } from 'ethers/lib/utils';
import { expect } from 'chai';
const os = require('os')
const util = require('./util');

describe("MetaStocks Testing", async () => {

    const deployedContracts: any = [

    ]

    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    let router: Contract;

    let metaStocksToken: Contract;
    let metaStocksTokenImplementationAddress: string;

    let metaStocksCompany: Contract;
    let metaStocksCompanyImplementationAddress: string;


    let metaStocksFranchise: Contract;
    let metaStocksFranchiseImplementationAddress: string;


    let metaStocksCompanyManager: Contract;
    let metaStocksCompanyManagerImplementationAddress: string;

    let metaStocksFranchiseManager: Contract;
    let metaStocksFranchiseManagerImplementationAddress: string;

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

        it("1.2 - Deploy MetaStocksToken", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaStocksToken'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaStocksToken = await upgrades.deployProxy(contractFactory, ["MetaStocksToken", "MST", parseEther("1000000")])
            await metaStocksToken.deployed()
            metaStocksTokenImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaStocksToken.address
            )

            console.log(`${colors.cyan(contractName + 'ProxyAddress: ')} ${colors.yellow(metaStocksToken.address)}`)
            console.log(`${colors.cyan(contractName + 'ImplAddress: ')} ${colors.yellow(metaStocksTokenImplementationAddress)}`)

            deployedContracts.push({
                contractName: {
                    address: metaStocksToken.address
                }
            })
        });

        it("1.3 - Deploy MetaStocksCompany", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaStocksCompany'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaStocksCompany = await upgrades.deployProxy(contractFactory)
            await metaStocksCompany.deployed()
            metaStocksCompanyImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaStocksCompany.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaStocksCompany.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaStocksCompanyImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaStocksCompany.address
                }
            })
        });


        it("1.4 - Deploy MetaStocksFranchise", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaStocksFranchise'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaStocksFranchise = await upgrades.deployProxy(contractFactory)
            await metaStocksFranchise.deployed()
            metaStocksFranchiseImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaStocksFranchise.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaStocksFranchise.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaStocksFranchiseImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaStocksFranchise.address
                }
            })
        });
    });

    describe("2.0 - Deploy Deploy MetaStock Contract Managers", async () => {


        it("2.3 - Deploy MetaStocksFranchiseManager", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaStocksFranchiseManager'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaStocksFranchiseManager = await upgrades.deployProxy(contractFactory, [metaStocksFranchise.address])
            await metaStocksFranchiseManager.deployed()
            metaStocksFranchiseManagerImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaStocksFranchise.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaStocksFranchiseManager.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaStocksFranchiseManagerImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaStocksFranchiseManager.address
                }
            })
        });

        it("2.1 - Deploy MetaStocksCompanyManager", async () => {
            console.log("");
            // DEPLOY
            const contractName = 'MetaStocksCompanyManager'
            const contractFactory = await ethers.getContractFactory(contractName)
            metaStocksCompanyManager = await upgrades.deployProxy(contractFactory, [metaStocksCompany.address, metaStocksFranchiseManager.address])
            await metaStocksCompanyManager.deployed()
            metaStocksCompanyManagerImplementationAddress = await getImplementationAddress(
                ethers.provider,
                metaStocksCompanyManager.address
            )

            console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(metaStocksCompanyManager.address)}`)
            console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(metaStocksCompanyManagerImplementationAddress)}`)
            console.log("");

            deployedContracts.push({
                contractName: {
                    address: metaStocksCompanyManager.address
                }
            })
        });



    });

    describe("3.0 - Transfer Ownerships", async () => {

        it("3.1 - Transfer Ownership MetastockCompany -> MetaStocksCompanyManager", async () => {
            await metaStocksCompany.transferOwnership(metaStocksCompanyManager.address);
        })

        it("3.2 - Transfer Ownership MetaStocksFranchise -> MetaStocksFranchiseManager", async () => {
            await metaStocksFranchise.transferOwnership(metaStocksFranchiseManager.address);
            await metaStocksFranchiseManager.setPaymentTokenAddress(metaStocksToken.address);
        })
    })

    describe("4.0 - Config MetaStocks Token", async () => {

        it("4.1 - Set setPaymentTokenAddress", async () => {
            await metaStocksFranchiseManager.setPaymentTokenAddress(metaStocksToken.address);
        })

        it("4.2 - Set Router", async () => {


            await metaStocksToken.connect(deployer).setRouterAddress("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3", "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"); // bsc testnet - bnb chanlink

        });

        it("4.3. Add Liquidity", async () => {



            await metaStocksToken.approve(util.chains.bsc.router, ethers.constants.MaxUint256, { from: deployer?.address })
            const tx = await router.connect(deployer).addLiquidityETH(
                metaStocksToken.address,
                parseEther("100000"),
                parseEther("100000"),
                parseEther("100"),
                deployer?.address,
                2648069985, // Saturday, 29 November 2053 22:59:45
                {
                    value: parseEther("100"),
                }
            )
            console.log(`${colors.cyan('TX')}: ${colors.yellow(tx.hash)}`)
            console.log()

            const routerFactory = await util.connectFactory();
            const pairAddress = await routerFactory.getPair(util.chains.bsc.wChainCoin, metaStocksToken.address)
            await metaStocksToken.setPairAddress(pairAddress);
            const pairContract = await util.connectPair(pairAddress);
            console.log(`${colors.cyan('LP Address')}: ${colors.yellow(pairContract?.address)}`)
            console.log(`${colors.cyan('LP Balance')}: ${colors.yellow(formatEther(await pairContract.balanceOf(deployer?.address)))}`)
            expect(1).to.be.eq(1);
            console.log()
        });


        it("4.3 - Enable trading", async () => {
            await metaStocksToken.enableTrading();
            console.log()
        });

        it("4.4 - Transfer From Owner To Bob ", async () => {
            console.log(`${colors.cyan("Deployer Token Balance:")} ${colors.yellow(formatEther(await metaStocksToken.balanceOf(deployer?.address)))}`)
            expect(await metaStocksToken.balanceOf(deployer?.address)).to.be.gt(parseEther("0"));

            //await metaStocksToken.transfer(bob?.address, parseEther("1000"))
            await metaStocksToken.connect(deployer).transfer(bob?.address, parseEther("500"))
            console.log(`${colors.cyan("Bob Token Balance:")} ${colors.yellow(formatEther(await metaStocksToken.balanceOf(bob?.address)))}`)
            expect(await metaStocksToken.balanceOf(bob?.address)).to.be.gt(parseEther("0"));
            console.log()
        });
    })



    describe("5.0 - Config contract", async () => {


        it("5.2 - Set Payment Token Address MetaStocksFranchise", async () => {
            await metaStocksToken.connect(deployer).transfer(metaStocksFranchiseManager?.address, parseEther("10000"))
            await metaStocksToken.connect(bob).approve(metaStocksFranchiseManager.address, parseEther("1000000000"))
            await metaStocksFranchiseManager.setPaymentTokenAddress(metaStocksToken.address);
        })

        it("5.2.1 - setRouterAddress", async () => {
            await metaStocksFranchiseManager.connect(deployer).setRouterAddress("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3", "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"); // bsc testnet - bnb chanlink

        })


        /*
        it("5.3 - Create createCompany", async () => {
            await metaStocksCompanyManager.connect(bob).createCompany();
            await sleep(2000)
        })
        */

        it("5.3 - Create MetaStocksFranchise", async () => {
            await metaStocksCompanyManager.connect(bob).createCompany();
            await sleep(2000)

            await metaStocksCompanyManager.connect(bob).createFranchiseUsingBNB({ value: parseEther("1000") });
            await sleep(2000)

            const isCeo = await metaStocksCompanyManager.isCeo(bob.address);
            console.log(`${colors.cyan("isCeo: ")} ${colors.yellow(isCeo)}`)

            const companyId = await metaStocksCompanyManager.getCompanyId(bob.address);
            console.log(`${colors.cyan("CompanyId: ")} ${colors.yellow(companyId)}`)

            let companyCeoAddress = await metaStocksCompanyManager.getCompanyCEOAddress(companyId);
            console.log(`${colors.cyan("CompanyCEOAddress: ")} ${colors.yellow(companyCeoAddress)}`)
        })

        it("5.4 - Get MetaStocks Franchise Number", async () => {
            const companyId = await metaStocksCompanyManager.getCompanyId(bob.address);
            const franchisesNumber = await metaStocksFranchiseManager.connect(bob).getNumberOfMetaStocksFranchises(companyId)
            expect(franchisesNumber).to.be.eq(1);
            console.log(`${colors.cyan("Franchises Number: ")} ${colors.yellow(franchisesNumber)}`)
        })


        it("5.5 - Claim From All Franchises", async () => {
            const companyId = await metaStocksCompanyManager.getCompanyId(bob.address);

            const bobBalance = await metaStocksToken.balanceOf(bob?.address);
            console.log(`${colors.cyan("Bob Balance Before Claim: ")} ${colors.yellow(formatEther(bobBalance))}`)

            const getMetaStocksFranchisesUnclaimedRewards = await metaStocksFranchiseManager.connect(bob).getMetaStocksFranchisesUnclaimedRewards(companyId)
            console.log(`${colors.cyan("getMetaStocksFranchisesUnclaimedRewards : ")} ${colors.yellow(formatEther(getMetaStocksFranchisesUnclaimedRewards))}`)

            await sleep(5000)
            await metaStocksFranchiseManager.connect(bob).claimFromAllFranchises(companyId)


            const getMetaStocksFranchisesUnclaimedRewardsAfter = await metaStocksFranchiseManager.connect(bob).getMetaStocksFranchisesUnclaimedRewards(companyId)
            console.log(`${colors.cyan("getMetaStocksFranchisesUnclaimedRewardsAfter : ")} ${colors.yellow(formatEther(getMetaStocksFranchisesUnclaimedRewardsAfter))}`)


            const bobBalanceAfter = await metaStocksToken.balanceOf(bob?.address);
            console.log(`${colors.cyan("Bob Balance After Claim: ")} ${colors.yellow(formatEther(bobBalanceAfter))}`)
        })
    });


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
