// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IKasiopea {
    function getManager(address _account) external view returns (address);
}
