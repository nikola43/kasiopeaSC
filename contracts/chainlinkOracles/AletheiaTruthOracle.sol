// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AletheiaTruthOracle is Initializable {
    address private _owner;
    AggregatorV3Interface private kimdomTokenPriceOracle;

    // Modifier to verify the caller is the owner of the contract
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    function initialize(address kindomTokenAddress) public initializer {
        _owner = msg.sender;
        kimdomTokenPriceOracle = AggregatorV3Interface(kindomTokenAddress);
    }

    function self() public view returns (address) {
        return address(this);
    }

    /**
     * @dev Transfers ownership of the contract to a new account ('newOwner').
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function setOracles(address kindomTokenAddress) public onlyOwner {
        kimdomTokenPriceOracle = AggregatorV3Interface(kindomTokenAddress);
    }

    function getKimdomTokenPriceOracle()
        public
        view
        returns (AggregatorV3Interface)
    {
        return kimdomTokenPriceOracle;
    }

    function askOracle(AggregatorV3Interface oracle)
        internal
        view
        returns (int256)
    {
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = oracle.latestRoundData();
        return price;
    }
}
