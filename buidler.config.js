usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin('solidity-coverage')

const INFURA_PROJECT_ID = "bfe3afaffb0f41938fbf81761d32828d";

module.exports = {
    solc: {
        version: "0.6.6"
      },
      paths: {
        sources: "./contracts/defipie",
      }
  };
