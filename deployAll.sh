#!/usr/bin/bash
# A sample Bash script, by Ryan

npx hardhat run scripts/deployAllContracts.ts --network bsctestnet
npx hardhat run scripts/deployAllContracts.ts --network mumbai
npx hardhat run scripts/deployAllContracts.ts --network hecoTestnet
npx hardhat run scripts/deployAllContracts.ts --network avalancheFujiTestnet
npx hardhat run scripts/deployAllContracts.ts --network fantomTestnet
npx hardhat run scripts/deployAllContracts.ts --network harmonyTestnet
npx hardhat run scripts/deployAllContracts.ts --network optimismTestnet