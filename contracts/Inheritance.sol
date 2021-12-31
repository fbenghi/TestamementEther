//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Inheritance {

    struct Testament {
        address payable beneficiary;
        uint deposit;
        uint lastCounterReset;
        uint maxCount;
        bool beneficiaryCanWithdraw;
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
        _testament.maxCount    = _maxCount;

        setCounterInitialState(_testament);
        

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
            uint maxCount,
            bool beneficiaryCanWithdraw
        )
        
    {
        return (testaments[owner].beneficiary,
            testaments[owner].deposit,
            testaments[owner].lastCounterReset,
            testaments[owner].maxCount,
            testaments[owner].beneficiaryCanWithdraw
        );
    }

    function setCounterInitialState(Testament storage _testament) internal
    {
        _testament.lastCounterReset = block.timestamp;
        _testament.beneficiaryCanWithdraw = false;
    }

    function resetCounter() public
    {
        Testament storage _testament = testaments[msg.sender];
        
        if(_testament.lastCounterReset != 0)
        {
            setCounterInitialState(_testament);
        }
    }

    function checkTimeout(address payable owner)  public
    {
        Testament storage _testament = testaments[owner];

        require(_testament.lastCounterReset != 0, "No testament available");
        require((testaments[owner].lastCounterReset+testaments[owner].maxCount) < block.timestamp, 
                 "Not enough time passed by");
        
        _testament.beneficiaryCanWithdraw = true;
    }

    function beneficiaryWithdraw(address payable owner) public 
    {
        Testament storage _testament = testaments[owner];
        uint deposit = _testament.deposit;

        require(_testament.lastCounterReset > 0, "No testament available");
        require(_testament.beneficiaryCanWithdraw, "Not enough time to withdraw");
        require(_testament.deposit > 0, "Not enough assets left");
        require(_testament.beneficiary == msg.sender, "Not beneficiary");

        _testament.deposit = 0;
        payable(msg.sender).transfer(deposit);
    }

}

