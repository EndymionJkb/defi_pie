const METAMASK_ADDRESS = "0x204012635024A578Ac60ce97A821c36F691beA85";
const GANACHE_ADDRESS = "0x4c2ffDaF95C065b6d4c65aCDc68D3ed83E5d1051";

describe("Web3 connectivity", function() {
    let accounts;
  
    before(async function() {
      accounts = await web3.eth.getAccounts();
    });
  
    describe("Check Ganache address", function() {
      it("Should see my address", async function() {
          expect(accounts[0]).to.equal(GANACHE_ADDRESS)
      });
    });
  });
