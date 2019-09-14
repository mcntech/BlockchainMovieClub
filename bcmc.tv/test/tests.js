var bcmc = require('../build/contracts/bcmc.json')
const truffleAssert = require('truffle-assertions');
const BN = web3.utils.BN;
let accounts;
let contractAccount = "0x0000000000000000000000000000000000000100"; 
//let contractAccount = "0x47a2Db5D68751EeAdFBC44851E84AcDB4F7299Cc"; 

async function registerMovie(bcmc, client) {
	  //const id = randInt();
	  //const value = (new BN('10')).pow(new BN('19'));
	  //await bcmc.registerMovie("http://demo.zeeth.io/movie1.m3u8", "thumb","Bigbuck Bunny","A good movie", 295, 10, 1, 1234, "0xffcf8fdee72ac11b5c542428b35eef5769c409f0", { from: client });
	  await bcmc.methods.registerMovie("http://demo.zeeth.io/movie1.m3u8", "thumb","Bigbuck Bunny","A good movie", 295, 10, 1, 1234, "0xffcf8fdee72ac11b5c542428b35eef5769c409f0").send( { from: client });
}
async function registerPlayer(bcmc, client) {
	  //const id = randInt();
	  //const value = (new BN('10')).pow(new BN('19'));
	  await bcmc.methods.registerPlayer(10, 1, "0xffcf8fdee72ac11b5c542428b35eef5769c409f0").send({ from: client });
}

async function registerAdvert(bcmc, client) {
	  //const id = randInt();
	  //const value = (new BN('10')).pow(new BN('19'));
	  await bcmc.methods.registerAdvert("http://demo.zeeth.io/movie1.m3u8", 295, 10).send({from: client });
}
contract("Bcmc", accounts => {

 	 beforeEach('initialize contracts', async () => {
	 	accounts = await web3.eth.getAccounts();
		 console.log(accounts);
	  	manager = accounts[0];
	  	this.mBcmc = await new web3.eth.Contract(bcmc.abi, contractAccount);
	 });

	describe("bcmc", () => {

		it('should be deployed correctly', async () => {
      			assert.notEqual(this.mBcmc, null, "bcmc not deployed");
   		});

   		it("Register movie", async () => {
	   		await registerMovie(this.mBcmc, manager);
		});
   		it("Register player", async () => {
	   		await registerPlayer(this.mBcmc, manager);
		});
   		it("Register advert", async () => {
	   		await registerAdvert(this.mBcmc, manager);
		});
	});
});
