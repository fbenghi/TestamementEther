//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Inheritance {

    struct Testament {
        address payable beneficiary;
        uint deposit;
        uint lastCounterReset;
        uint maxCount;
    }

    mapping(address => Testament) public testaments;

    constructor() {
        console.log("Contract deployed");
    }

    function setTestament(address payable _beneficiary, uint _maxCount) 
        public
        payable
    {
        Testament storage _testament = testaments[msg.sender];

        // If sender already had deposits, add to previous
        _testament.deposit     = msg.value+_testament.deposit;

        // Other variables can be simply overwritten 
        _testament.beneficiary = _beneficiary;        
        _testament.lastCounterReset = block.timestamp;
        _testament.maxCount    = _maxCount;
        
        
        console.log("Asset Owner: ", msg.sender);
        console.log("Beneficiary: ", testaments[msg.sender].deposit);
        console.log("Last time counter was reset ", testaments[msg.sender].lastCounterReset);
    }

    function getTestament(address payable owner) 
        public
        view
        returns (
            address payable beneficiary,
            uint deposit,
            uint lastCounterReset,
            uint maxCount
        )
        
    {
        return (testaments[owner].beneficiary,
            testaments[owner].deposit,
            testaments[owner].lastCounterReset,
            testaments[owner].maxCount
        );
    }

}

