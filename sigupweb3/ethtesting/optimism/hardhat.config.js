require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.20",
    networks: {
        opSepolia: {
            url: 'YOUR SOPOLIA TEST_NET RPC',
            accounts: ["YOUR_PRIVATE_KEY"],
        },
    },
};