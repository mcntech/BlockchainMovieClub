var http = require('http');
var Eth = require('web3-eth');
var bcmc = require('../build/contracts/bcmc.json')
var app = http.createServer(function execute(request, response){});
var io = require('socket.io').listen(app);
var drmsrv = require('./drmsrv');

var eth = new Eth('ws://127.0.0.1:8545');
//var eth = new Eth('http://127.0.0.1:8545');
eth.getAccounts(console.log);

io.on('connection', function(socket) {
    socket.on('eth_rawtransaction', function(data){
        console.log("recieved data:");
        console.log(data);
        eth.sendSignedTransaction(data).on('receipt', console.log);
    });
    
    socket.on('eth_get_account', function(account){
        console.log("eth_get_account:" + account);
        eth.getTransactionCount(account).then(function(nonce){
        	console.log("eth_get_account:nonce=" + nonce);
        	socket.emit('account_nonce',nonce);
        });
    });
    
    socket.on('eth_call', function(data){
        console.log("eth_call:" + data);
        var obj = JSON.parse(data);
        eth.call(obj).then(function(result){
        	console.log("eth_call:result=" + result);
        	socket.emit('eth_call_result',result);
        });
    });
    
    socket.on('eth_call_request', function(data){
        console.log("eth_call_request:" + data);
        var request = JSON.parse(data);
        eth.call(request.calldata).then(function(_result){
        	var response = {cmd: request.cmd, result : _result} 
        
        	console.log("eth_call_response:result=" + JSON.stringify(response));
        	socket.emit('eth_call_response',JSON.stringify(response));
        });
    });
});

const contractAccount = '0xcfeb869f69431e42cdb54a4f4f105c19c080a601';
var contract = new eth.Contract(bcmc.abi, contractAccount);

//console.log(contract);
var _fromBlock = 0;
function pollEvents(){

	eth.getBlock('latest').then(res => {
		  console.log(`Starting event watchers from block ${res.number}`)
		  if(_fromBlock != res.number) {
			  contract.events.allEvents({ fromBlock: res.number }, eventHandler);
		  }
		  _fromBlock = res.number;
	})
	
	//setTimeout(pollEvents, 1000);
}


function eventHandler(err, result) {
	console.log("event callback:");console.log(result);
	if(result.event == 'MovieViewTokenRequested') {
		var Result = result.returnValues;
		console.log(Result);
		doDrm(Result.drmprovider, Result.buyer, Result.buyerkey, Result.movieid);
	}
}

function doDrm(drmprovider, buyer, buyerkey, id)
{
	// Query DRM enckey for the movie id using drmprovider
	var enckey = 'F10DF10DF10DF10DF10DF10DF10DF10D';
	var testPubKey = "bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06eceacf2b81dd326d278cd992d5e03b0df140f2df389ac9a1c2415a220a4a9e8c046";
	// buyerkey
	drmsrv.encryptWithPublicKey(testPubKey, enckey).then( drmData => {
	
		console.log(drmData);
	
		var callData = contract.methods.grantViewToken(buyer,id, JSON.stringify(drmData)).encodeABI();
		eth.sendTransaction({from:drmprovider, to: contractAccount, data: callData, gas:4000000});
	}, err => {
		console.log(`doDrm:Error: ${err}`);
	});
}


pollEvents(0);

console.log("Listening on 8090");
app.listen(8090);
