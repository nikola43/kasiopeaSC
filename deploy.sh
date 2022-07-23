#!/bin/bash
rm -rf cache
rm -rf bin
rm -rf artifacts
rm -rf cache

network="bsctestnet"
script="deployMetaStocks"
cmd="npx hardhat run --network $network scripts/$script.ts"

echo "$($cmd)"


#cmd2="npx hardhat verify --network bsctestnet --constructor-args TokenConstructorArguments.js $executionResult"