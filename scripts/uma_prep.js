const bre = require("@nomiclabs/buidler");
const iwl = artifacts.require("IdentifierWhitelist");
const emc = artifacts.require("ExpiringMultiPartyCreator");
const awl = artifacts.require("AddressWhitelist");
const tf = artifacts.require("TokenFactory");
const reg = artifacts.require("Registry");
const legos = require("@studydefi/money-legos");
const fs = require("fs");

var utils = require('ethers').utils;

// This address must be unlocked in the Ganache instance
UMA_CONTRACT_OWNER = '0x592349f7dedb2b75f9d4f194d4b7c16d82e507dc';

IDENTIFIER_WHITELIST_CONTRACT = '0xcF649d9Da4D1362C4DAEa67573430Bd6f945e570';
REGISTRY_CONTRACT = '0x3e532e6222afe9Bcf02DCB87216802c75D5113aE';
FINDER_CONTRACT = '0x40f941E48A552bF496B154Af6bf55725f18D77c3';
PRODUCTION_TIMER_ADDRESS = '0x0000000000000000000000000000000000000000';
AETH_ADDRESS = '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04';
DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
ADAI_ADDRESS = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';
USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
AUSDC_ADDRESS = '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E';
AWBTC_ADDRESS = '0xFC4B8ED459e00e5400be803A9BB3954234FD50e3';
ALEND_ADDRESS = '0x7D2D3688Df45Ce7C552E19c27e007673da9204B8';

PRICE_IDENTIFIERS = ['MyDefiPie-1', 'MyDefiPie-2', 'MyDefiPie-3']
COLLATERAL_COINS = [AETH_ADDRESS, DAI_ADDRESS, ADAI_ADDRESS, USDC_ADDRESS, AUSDC_ADDRESS, AWBTC_ADDRESS, ALEND_ADDRESS];

async function main() {
    const [sender] = await ethers.getSigners();
    /*console.log(
        "Deploying contracts from:",
        await sender.getAddress()
    );*/
 
    const identifierWhitelist = await iwl.at(IDENTIFIER_WHITELIST_CONTRACT);

    for (var i = 0; i < PRICE_IDENTIFIERS.length; i++) {
        console.log("Adding " + PRICE_IDENTIFIERS[i] + " to Whitelist");

        await identifierWhitelist
              //.connect(UMA_CONTRACT_OWNER)
              .addSupportedIdentifier(utils.formatBytes32String(PRICE_IDENTIFIERS[i]), {from: UMA_CONTRACT_OWNER, gasPrice:"0"})
    }
    /*const abiJson = fs.readFileSync("token_abis.json");
    const abis = JSON.parse(abiJson);
    console.log(abis['aDai'])

    var aDai = new ethers.Contract('0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
                                   JSON.parse(abis['aDai']),
                                   sender);*/


    console.log("Deploying AddressWhitelist")
    const AddressWhitelist = await ethers.getContractFactory("AddressWhitelist");
    const addressWhitelist = await AddressWhitelist.deploy();
    await addressWhitelist.deployed();

    // Add all possible collateral tokens to the whitelist
    console.log("Adding collateral coins to whitelist");
    for (var i = 0; i < COLLATERAL_COINS.length; i++) {
        addressWhitelist.addToWhitelist(COLLATERAL_COINS[i]);
    }

    console.log("Deploying TokenFactory")
    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactory.deploy();
    await tokenFactory.deployed();

    console.log("Deploying ExpiringMultiPartyCreator")
    const ExpiringMultiPartyCreator = await ethers.getContractFactory("ExpiringMultiPartyCreator");
    const empCreator = await ExpiringMultiPartyCreator.deploy(FINDER_CONTRACT,
                                                              addressWhitelist.address,
                                                              tokenFactory.address,
                                                              PRODUCTION_TIMER_ADDRESS);
    await empCreator.deployed();
    console.log(empCreator.address);

    fs.writeFile('../pie_rails/db/data/ExpiringMultiPartyCreator.txt',
                 empCreator.address, function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('Saved ExpiringMultiPartyCreator address!');
    });

    fs.writeFile('../pie_rails/db/data/TokenFactory.txt',
                 tokenFactory.address, function (err) {
                 if (err) {
                     throw err;
                 }
                 console.log('Saved TokenFactory address!');
    });

    // Add new creator to registry
    const registry = await reg.at(REGISTRY_CONTRACT);
    await registry.addMember(1, empCreator.address, {from: UMA_CONTRACT_OWNER, gasPrice: "0"});
 }

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});