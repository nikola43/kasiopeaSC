// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IAletheiaTruthOracle {
    function pickRandomFlowerColor() external view returns (string memory);
}
