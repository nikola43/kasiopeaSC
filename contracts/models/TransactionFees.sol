// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

struct TransactionFees {
    uint16 buyFee; // fee when people BUY tokens using router
    uint16 sellFee; // fee when people SELL tokens using router
    uint16 transferFee; // fee when people TRANSFER tokens from wallet to wallet
}
