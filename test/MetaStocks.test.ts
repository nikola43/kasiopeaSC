import { ethers } from 'hardhat'
const test_util = require('./util');
const { parseEther } = ethers.utils;
const colors = require('colors');
import { expect } from 'chai'
import { formatEther } from 'ethers/lib/utils';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hre from 'hardhat'
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

//available functions
describe("Token contract", async () => {

    let tokenDeployed: Contract;
    let router: Contract;
    let busdContract: Contract;

    let pairContract: Contract;
    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    it("1. Get Signer", async () => {
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

        const networkName = hre.network.name
        const chainId = hre.network.config.chainId

        console.log(`${colors.cyan('networkName')}: ${colors.yellow(networkName)}`)
        console.log(`${colors.cyan('chainId')}: ${colors.yellow(chainId)}`)
    });

    it("2. Deploy Contract", async () => {

        // INSTANCE CONTRACT
        router = await test_util.connectRouter()
        //routerFactory = await test_util.connectFactory()
        //bnbContract = await test_util.connectWBNB()
        busdContract = await test_util.connectBUSD()

        // DEPLOY
        // ITERABLE MAPPING
        const iterableMappingFactory = await ethers.getContractFactory("IterableMapping")
        const IterableMappingDeployed = await iterableMappingFactory.deploy()
        await IterableMappingDeployed.deployed()
        console.log({
            IterableMappingDeployed: IterableMappingDeployed.address
        })
        const tokenFactory = await ethers.getContractFactory("MetaStocksToken", {
            libraries: {
                IterableMapping: IterableMappingDeployed.address
            },
        });


        const contractName = "TykheFortuneDistributor";
        const factory = await ethers.getContractFactory(contractName)
        let args = ["hi", "hi", 100000000];
        const contract = await test_util.deployProxyV2(factory, contractName, args, false);
        const contractImpl = await getImplementationAddress(
            ethers.provider,
            contract.address
        )
        //const contractDeployed = await contract.deployed()

        console.log("");
        console.log(colors.green('Deploy Successfully!'));
        console.log(`${colors.cyan(contractName + ' Proxy Address: ')} ${colors.yellow(contract.address)}`)
        console.log(`${colors.cyan(contractName + ' Implementation Address: ')} ${colors.yellow(contractImpl)}`)
        console.log("");

        const token = await tokenFactory.deploy(router.address, test_util.chains.bsc.BUSD, contract.address);
        tokenDeployed = await token.deployed();
        console.log("Deploying upgradeable contract of ZoeToken...");

        console.log(`${colors.cyan('Token Address')}: ${colors.yellow(tokenDeployed?.address)}`)

    });

    it("3. Add Liquidity", async () => {
        await tokenDeployed.approve(test_util.chains.bsc.router, ethers.constants.MaxUint256, { from: deployer?.address })
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
        )
        console.log(`${colors.cyan('TX')}: ${colors.yellow(tx.hash)}`)
        console.log()

        const routerFactory = await test_util.connectFactory();
        const pairAddress = await routerFactory.getPair(test_util.chains.bsc.wChainCoin, tokenDeployed.address)
        pairContract = await test_util.connectPair(pairAddress);
        console.log(`${colors.cyan('LP Address')}: ${colors.yellow(pairContract?.address)}`)
        console.log(`${colors.cyan('LP Balance')}: ${colors.yellow(formatEther(await pairContract.balanceOf(deployer?.address)))}`)
        expect(1).to.be.eq(1);
        console.log()
    });

    it("4. Enable trading", async () => {
        await tokenDeployed.enableTrading();
        console.log()
    });

    it("5. Transfer From Owner To Bob ", async () => {
        await tokenDeployed.connect(deployer).transfer(bob?.address, parseEther("1000"))
        expect(await tokenDeployed.balanceOf(bob?.address)).to.be.eq(parseEther("1000"));
        console.log()
    });

    it("6. Transfer From Bob To Alice ", async () => {
        await tokenDeployed.connect(deployer).transfer(alice?.address, parseEther("1000"))
        expect(await tokenDeployed.balanceOf(alice?.address)).to.be.eq(parseEther("1000"));
    });

    it("7. Buy Deployer", async () => {
        console.log(`${colors.cyan('Bob BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(bob.address)))}`)

        console.log()
        console.log(`${colors.cyan('Bob BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(bob.address)))}`)
        console.log(`${colors.cyan('Alice BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(alice.address)))}`)
        console.log()
        //--- BUY
        console.log(`${colors.cyan('Contract token Balance Before Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, deployer, parseEther("1"));
        console.log(`${colors.cyan('Bob token Balance After Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(deployer?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });


    it("8. Sell Deployer", async () => {
        await test_util.sleep(5);
        await tokenDeployed.connect(deployer).approve(router.address, parseEther("100000"))
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, deployer, parseEther("10")); // 100 tokens
        console.log(`${colors.cyan('Bob token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });

    it("9. Buy Bob", async () => {
        console.log()
        //--- BUY
        console.log(`${colors.cyan('Contract token Balance Before Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, bob, parseEther("10"));
        console.log(`${colors.cyan('Bob token Balance After Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });


    it("10. Sell Bob", async () => {
        await test_util.sleep(5);
        await tokenDeployed.connect(bob).approve(router.address, parseEther("100000"))
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, bob, parseEther("10")); // 100 tokens
        console.log(`${colors.cyan('Bob token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });

    it("11. Buy Alice", async () => {
        console.log()
        //--- BUY
        console.log(`${colors.cyan('Contract token Balance Before Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, alice, parseEther("10"));
        console.log(`${colors.cyan('Alice token Balance After Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(alice?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });


    it("12. Sell Alice", async () => {
        await test_util.sleep(5);
        await tokenDeployed.connect(bob).approve(router.address, parseEther("100000"))
        await test_util.swapExactETHForTokens(tokenDeployed.address, router, alice, parseEther("10")); // 1000 tokens
        console.log(`${colors.cyan('Alice token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(alice?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });

    it("13. Check balances", async () => {
        console.log(`${colors.cyan('Bob token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Alice token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(alice?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()

        console.log(`${colors.cyan('Bob BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(bob.address)))}`)
        console.log(`${colors.cyan('Contract BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(tokenDeployed.address)))}`)
        console.log(`${colors.cyan('Alice BUSD Balance After')}: ${colors.yellow(formatEther(await busdContract.balanceOf(alice.address)))}`)
    });

    it("14. Check withdrawable dividends", async () => {
        const bobDividend = await tokenDeployed.connect(bob).getWithdrawableDividendOf(bob.address)
        const aliceDividend = await tokenDeployed.connect(alice).getWithdrawableDividendOf(alice.address)
        console.log(`${colors.cyan('Bob dividends')}: ${colors.yellow(formatEther(bobDividend))}`)
        console.log(`${colors.cyan('Alice dividends')}: ${colors.yellow(formatEther(aliceDividend))}`)
    });

    it("15. Exclude from Fees", async () => {
        const signers = await ethers.getSigners();
        const tx = await tokenDeployed.excludeFromFee(signers[10]?.address, true);
        console.log(`${colors.cyan('Is exclude from Fee?')}: ${colors.yellow(tx)}`)
    });
});