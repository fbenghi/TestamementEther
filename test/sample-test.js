const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Deploy", function () {
  it("Should deploy the contract", async function () {
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });
});


describe("SetTestament", function () {
  let Inheritance;
  let inheritance;

  beforeEach(async function() {
    Inheritance = await ethers.getContractFactory("Inheritance");
    inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });


  it("Add new entry", async function () {

    // Accounts
    const accounts = await ethers.getSigners();
    const owner   = accounts[0];
    const beneficiary = accounts[1];

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary.address, 1000, overrides);

    // Get values from contract
    var test = await inheritance.getTestament(owner.address);

    // Testing
    expect(test[0]).to.equal(beneficiary.address);
    expect(test[1]).to.equal(ethers.utils.parseEther("1.0") );
  });

  it("Add value to existing entry", async function () {
    // Accounts
    const accounts = await ethers.getSigners();
    const owner   = accounts[0];
    const beneficiary1 = accounts[1];
    const beneficiary2 = accounts[1];

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary1.address, 1000, overrides);
    await inheritance.setTestament(beneficiary2.address, 1000, overrides);

    // Get values from contract
    var test = await inheritance.getTestament(owner.address);

    // Testing
    expect(test[0]).to.equal(beneficiary2.address);
    expect(test[1]).to.equal(ethers.utils.parseEther("2.0") );
  });
});

describe("ResetCounter", function () {

  let Inheritance;
  let inheritance;

  beforeEach(async function() {
    Inheritance = await ethers.getContractFactory("Inheritance");
    inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });


  it("Check if counter was reset to new timestamp", async function () {
    // Accounts
    const accounts = await ethers.getSigners();
    const owner   = accounts[0];
    const beneficiary = accounts[1];

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary.address, 1000, overrides);
    
    // Get values from contract
    var test1 = await inheritance.getTestament(owner.address);

    await inheritance.resetCounter();
    var test2 = await inheritance.getTestament(owner.address);

    expect(test1.lastCounterReset.toNumber()).to.lessThan(test2.lastCounterReset.toNumber());
  });
});

describe("CheckTimeout", function () {
  let Inheritance;
  let inheritance;

  beforeEach(async function() {
    Inheritance = await ethers.getContractFactory("Inheritance");
    inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });

  it("Enough time to withdraw assets", async function () {

    // Accounts
    const accounts = await ethers.getSigners();
    const owner   = accounts[0];
    const beneficiary = accounts[1];

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary.address, 1, overrides);

    // Increase blocks count
    await network.provider.send("evm_mine")
    await network.provider.send("evm_mine")

    // Check if enough time has passed
    await inheritance.checkTimeout(owner.address);
    var test = await inheritance.getTestament(owner.address);

    // Beneficiary can withdraw assets
    expect(test.beneficiaryCanWithdraw).to.be.true;
  });

  it("NOT enough time to withdraw assets", async function () {

    // Accounts
    const accounts = await ethers.getSigners();
    const owner   = accounts[0];
    const beneficiary = accounts[1];

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary.address, 10, overrides);

    // Increase blocks count
    await network.provider.send("evm_mine")
    
    // Check if enough time has passed - It hasnt
    await expect( inheritance.checkTimeout(owner.address) ).to.be.reverted;
    
    // Assets no available
    var test = await inheritance.getTestament(owner.address);
    expect(test.beneficiaryCanWithdraw).to.be.false;
  });
});


describe("BeneficiaryWithdraw", function () {
  // Contract instances
  let Inheritance;
  let inheritance;

  // Acounts
  let accounts;
  let owner;
  let beneficiary;
  let thief;

  // Balances
  let beneficiaryInitialAmount;



  beforeEach(async function() {
    Inheritance = await ethers.getContractFactory("Inheritance");
    inheritance = await Inheritance.deploy();
    await inheritance.deployed();

    accounts     = await ethers.getSigners();
    owner        = accounts[0];
    beneficiary  = accounts[1];
    thief        = accounts[2];

    beneficiaryInitialAmount = await ethers.provider.getBalance(beneficiary.address)

    // Send transaction
    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    }
    await inheritance.setTestament(beneficiary.address, 1, overrides);

    // Increase blocks count
    await network.provider.send("evm_mine")
    await network.provider.send("evm_mine")

    // Check if enough time has passed
    await inheritance.checkTimeout(owner.address);


  });


  it("Beneficiary can withdraw", async function () {
    
    // Beneficiary withdraw
    await inheritance.connect(beneficiary).beneficiaryWithdraw(owner.address);

    let beneficiaryFinalAmount = await ethers.provider.getBalance(beneficiary.address);
    console.log(ethers.utils.formatEther(beneficiaryInitialAmount));
    console.log(ethers.utils.formatEther(beneficiaryFinalAmount));
    expect(beneficiaryFinalAmount.gt(beneficiaryInitialAmount)).to.be.true;

  });

  it("Beneficiary CANNOT withdraw twice", async function () {
    
    // Beneficiary withdraw
    await inheritance.connect(beneficiary).beneficiaryWithdraw(owner.address);
    await expect( inheritance.connect(beneficiary).beneficiaryWithdraw(owner.address) ).to.be.reverted;
  });

  it("Thiefs CANNOT withdraw", async function () {
    await expect( inheritance.connect(thief).beneficiaryWithdraw(owner.address) ).to.be.reverted;
  });
});