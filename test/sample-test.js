const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy", function () {
  it("Should deploy the contract", async function () {
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });
});


describe("SetTestament", function () {
  it("Add new entry", async function () {
    // Deploy
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();
    await inheritance.deployed();

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
});

describe("SetTestament", function () {
  it("Add value to existing entry", async function () {
    // Deploy
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();
    await inheritance.deployed();

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