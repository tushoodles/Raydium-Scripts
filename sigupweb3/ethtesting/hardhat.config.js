require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    mumbai:{
      url:'https://polygon-amoy.infura.io/v3/f5a768bab80a4174a0a1dba65ab4e8bb',
      accounts:['62242119849d79dd04063595e32b1540e261fa561f7d283636abbef05579221d']
    }
  }
};
