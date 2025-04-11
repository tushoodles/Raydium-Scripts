const hre = require("hardhat");

async function main() {
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("MyToken", "MTK", 18, 1000000); 
    await myToken.deployed();
    console.log("MyToken deployed to:", myToken.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
