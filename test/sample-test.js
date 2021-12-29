const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy", function () {
  it("Should deploy the contract", async function () {
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();
    await inheritance.deployed();
  });
});
