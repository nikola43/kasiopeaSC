import { ethers, upgrades } from 'hardhat'
//const util = require('./util');
//const { parseEther } = ethers.utils;
const colors = require('colors');
//import { expect } from 'chai'
//import { formatEther } from 'ethers/lib/utils';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
//import { parseEther, formatEther } from 'ethers/lib/utils';

//available functions
describe("Token contract", async () => {

    let tokenDeployed: Contract;
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
    });

    it("2. Deploy Contract", async () => {
        // DEPLOY
        const contractName = 'MetaStocksCompany'
        const tokenFactory = await ethers.getContractFactory(contractName)
        tokenDeployed = await upgrades.deployProxy(tokenFactory, [])
        await tokenDeployed.deployed()
        //await tokenDeployed.setDexRouter("0x2D99ABD9008Dc933ff5c0CD271B88309593aB921");

        console.log("tokenDeployed:", tokenDeployed.address);
        expect(1).to.be.eq(1);
    });
});