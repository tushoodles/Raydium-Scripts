const { ethers } = require("hardhat");

async function main() {
    // Get the contract's deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the contract factory
    const Identeefi = await ethers.getContractFactory("Identeefi");

    // Deploy the contract
    console.log("Deploying contract...");
    const contract = await Identeefi.deploy(); // Ensure `await` is here
    await contract.deployed(); // Wait until deployment is mined

    console.log("Contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });