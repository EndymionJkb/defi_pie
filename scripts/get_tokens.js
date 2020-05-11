const bre = require("@nomiclabs/buidler");
const fs = require('fs');

const readFile = (path, opts = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  });

//const truffle = require("@nomiclabs/buidler-truffle5");

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

const USDC_PROXY = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_TOKEN_CONTRACT = "0x0882477e7895bdC5cea7cB1552ed914aB157Fe56";
const METAMASK_ADDRESS = "0x204012635024A578Ac60ce97A821c36F691beA85";
const USDC_HOLDER_ADDRESS = "0x8cee3eeab46774c1CDe4F6368E3ae68BcCd760Bf";

async function main() {
    // Buidler always runs the compile task when running scripts through it. 
    // If this runs in a standalone fashion you may want to call compile manually 
    // to make sure everything is compiled
    // await bre.run('compile');
  
    const abi = await readFile('artifacts/USDC.json');
    //console.log(JSON.parse(abi));

    accounts = await web3.eth.getAccounts();
    console.log("My account: " + accounts[0]);

    //const ERC20 = artifacts.require("ERC20");
    //const usdc = await ERC20.at(USDC_TOKEN_CONTRACT)
    var usdc = new web3.eth.Contract(JSON.parse(abi), USDC_TOKEN_CONTRACT, {
        from: USDC_HOLDER_ADDRESS, // default from address
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });


    await usdc.methods.transfer(METAMASK_ADDRESS, 20000).send({from: USDC_HOLDER_ADDRESS}).then(function(receipt) {
        console.log("Sent transaction");
        console.log(receipt);
    });
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
