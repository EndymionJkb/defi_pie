const bre = require("@nomiclabs/buidler");
const ERC20 = artifacts.require("ERC20");

const METAMASK_ADDRESS = "0x204012635024A578Ac60ce97A821c36F691beA85";
const PORTIS_ADDRESS = "0x10183B4C3d62E1d9FeBFcA6a67269335537B5454";

const USDC_TOKEN_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_TOKEN_CONTRACT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const DAI_TOKEN_CONTRACT = "0x6b175474e89094c44da98b954eedeac495271d0f";
const PBTC_TOKEN_CONTRACT = "0x5228a22e72ccc52d415ecfd199f99d0665e7733b";
const CRO_TOKEN_CONTRACT = "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b";
//const PAXG_TOKEN_CONTRACT = "0x45804880De22913dAFE09f4980848ECE6EcbAf78";

const USDC_HOLDER_ADDRESS = "0x8cee3eeab46774c1CDe4F6368E3ae68BcCd760Bf";
const USDT_HOLDER_ADDRESS = "0xf946010272F2f97EB5B4De57D4445E378c4BC547";
const DAI_HOLDER_ADDRESS = "0xe17dd26d980af5a072b6c485f5e37f9f287bebf5";
const PBTC_HOLDER_ADDRESS = "0x70654f55d6755358e6c4b75e367a08156aa40646";
const CRO_HOLDER_ADDRESS = "0xc97a4ed29f03fd549c4ae79086673523122d2bc5";
//const PAXG_HOLDER_ADDRESS = "0x711486216Eb92c00b1E09DEE88623898a9258F6a";

async function main() {
    console.log("Transferring 2000 USDC")
    await transfer_token(USDC_TOKEN_CONTRACT, 6, '2000', USDC_HOLDER_ADDRESS);
    console.log("Transferring 3000 DAI")
    await transfer_token(DAI_TOKEN_CONTRACT, 18, '3000', DAI_HOLDER_ADDRESS);
    console.log("Transferring 0.1 pBTC")
    await transfer_token(PBTC_TOKEN_CONTRACT, 18, '0.1', PBTC_HOLDER_ADDRESS);
    console.log("Transferring 500 CRO")
    await transfer_token(CRO_TOKEN_CONTRACT, 8, '500', CRO_HOLDER_ADDRESS);
    console.log("Transferring 3000 USDT")
    await transfer_token(USDT_TOKEN_CONTRACT, 6, '3000', USDT_HOLDER_ADDRESS);

    // transfer ETH
    const [sender] = await ethers.getSigners();
    for (x = 0; x < 10; x++) {
        const tx2 = await sender.sendTransaction({
            to: METAMASK_ADDRESS,
            value: ethers.constants.WeiPerEther,
          });
          await tx2.wait();    
    }
}

async function transfer_token(token_address, decimals, amount, from_address) {
    const token = await ERC20.at(token_address);
    var denomination = 'wei';
    var multiplier = 1;

    switch (decimals) {
        case 18: denomination = 'ether'; break;
        case 17: denomination = 'finney'; multipler = 100; break;
        case 16: denomination = 'finney'; multipler = 10; break;
        case 15: denomination = 'finney'; break;
        case 14: denomination = 'szabo'; multipler = 100; break;
        case 13: denomination = 'szabo'; multipler = 10; break;
        case 12: denomination = 'szabo'; break;
        case 11: denomination = 'gwei'; multipler = 100; break;
        case 10: denomination = 'gwei'; multipler = 10; break;
        case 9: denomination = 'gwei'; break;
        case 8: denomination = 'mwei'; multiplier = 100; break;
        case 7: denomination = 'mwei'; multipler = 10; break;
        case 6: denomination = 'mwei'; break
        case 5: denomination = 'kwei'; multipler = 100; break
        case 4: denomination = 'kwei'; multipler = 10; break
        case 3: denomination = 'kwei'; break;
        case 2: denomination = 'wei'; multipler = 100; break;
        case 1: denomination = 'wei'; multipler = 10; break;
        case 0: denomination = 'wei'; break;
    }

    if (multiplier != 1) {
        amount = (Number(amount) * multiplier).toString();
    }

    const token_amount = web3.utils.toWei(amount, denomination);
    //console.log("Token amount: " + token_amount);

    await token.transfer(METAMASK_ADDRESS, token_amount, {from: from_address})   
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});
