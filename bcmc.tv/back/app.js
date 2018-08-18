var http = require('http');
var Eth = require('web3-eth');
var bcmc = require('../build/contracts/bcmc.json')
var app = http.createServer(function execute(request, response){});
var io = require('socket.io').listen(app);
var drmsrv = require('./drmsrv');
const MongoClient = require('mongodb').MongoClient;


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
    
    socket.on('drm_update_drmtoken', function(data){
        console.log("drm_update_drmtoken:" + data);
        var request = JSON.parse(data);
        
        console.log("drmtoken:" + request.drmtoken);
        updateDrmToken(gDb, request.drmid, request.drmtoken).then(function(_result) {
        	var response = {cmd: request.cmd, result : _result} 
        	console.log("drm_update_drmtoken_resposne:result=" + JSON.stringify(response));
        	socket.emit('drm_update_drmtoken_resposne',JSON.stringify(response));
        }).catch(function(e){console.log(e)});
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
		genrateEncryptedDrmToken(Result.drmprovider, Result.buyer, Result.buyerkey, Result.movieid, Result.drmid);
	}
}


var defDrmToken = '{"org.w3.clearkey": {"clearkeys": {"nrQFDeRLSAKTLifXUIPiZg": "FmY0xnWCPCNaSpRG-tUuTQ"}}}';
var defMovieid = 1000000000;

function genrateEncryptedDrmToken(drmprovider, buyer, buyerkey, movieid, drmid)
{
	
	getDrmTokenFromDb(gDb, drmid).then(drmtoken => {
		// buyerkey
		console.log("drmtoken:" + drmtoken)
		drmsrv.encryptWithPublicKey(buyerkey, drmtoken).then( encDrmToken => {
		
			console.log("encDrmToken:" + {encDrmToken});
		
			var callData = contract.methods.grantViewToken(buyer, movieid, JSON.stringify(encDrmToken)).encodeABI();
			eth.sendTransaction({from:drmprovider, to: contractAccount, data: callData, gas:4000000});
		}, err => {
			console.log(`genrateDrmToken:encryptWithPublicKeyError: ${err}`);
		});
	}, err => {
		console.log(`genrateDrmToken:getDrmTokenFromDb:Error: ${err}`);
	});
}

//=====================================================================================================================
const url = 'mongodb://localhost:27017';
const dbName = 'bcmcdb';
const collectionName = 'drm';
var gDb = null;


function dbConnect(url){
	return new Promise(function(resolve, reject){
		MongoClient.connect(url, function(err, client) {
			//assert.equal(null, err);
			if(!err) {
				console.log("Connected successfully to server");
				var db = client.db(dbName);
				resolve(db);
			  //client.close();
			} else {
				console.log(err);
				reject(err);
			}
		});
	});
}

function updateDrmToken(db, id, drmtoken) {
	return new Promise(function(resolve, reject) {
	  const collection = db.collection(collectionName);
	  var document = {drmid : id, drmtoken : drmtoken}
	  var query = {drmid : id};
	  collection.update(query, document, { upsert: true }, function(err, result) {
			if(!err) {
				resolve(true);
			} else {
				reject(err);
			}
	  });
	});
}


function getDrmTokenFromDb(db, id){
	return new Promise(function(resolve, reject) {
	  const collection = db.collection(collectionName);
	  query = {drmid : id};
	  collection.find(query).toArray(function(err, result) {
	    	if(!err && result.length > 0){
	    		var entry = result[0];
	    		resolve(entry.drmtoken);
	    	} else {
	    		reject(err)
	    	}
	  });
	});
}

async function initDb() {
	gDb =  await dbConnect(url);
	// Insert default key
	try {
		
		// Query DRM enckey for the movie id using drmprovider
		var buyerkey = "bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06eceacf2b81dd326d278cd992d5e03b0df140f2df389ac9a1c2415a220a4a9e8c046";

		console.log("dbtest: updateDrmToken");
		await updateDrmToken(gDb, defMovieid, defDrmToken, console.log);
		console.log("dbtest: getDrmTokenFromDb");
		getDrmTokenFromDb(gDb, defMovieid).then(drmToken => {
			console.log("drmToken:" + {drmToken});
			
			drmsrv.encryptWithPublicKey(buyerkey, drmToken).then( encDrmToken => {
				console.log(encDrmToken);
			}, err => {
				console.log(`genrateDrmToken:encryptWithPublicKeyError: ${err}`);
			});
		},  err => {
			console.log(`genrateDrmToken:getDrmTokenFromDb:Error: ${err}`)});
	} catch(e) {
		console.log(e);
	}
}

//dbConnect(url).then(db => {console.log(db); gDb = dbConnect = db; insertDocuments(gDb, drmid, drmtoken, console.log);});
initDb();

//=======================================================================================================================

pollEvents(0);

//console.log("Listening on 8090");
app.listen(8090);
