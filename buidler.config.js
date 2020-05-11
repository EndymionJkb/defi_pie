usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-truffle5");

const INFURA_PROJECT_ID = "bfe3afaffb0f41938fbf81761d32828d";

module.exports = {
    solc: {
        version: "0.6.6"
      }/*,
      networks: {
        main: {
          url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
          accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
        }
    }*/
};
