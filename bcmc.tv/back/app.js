var http = require('http');
var Eth = require('web3-eth');

var app = http.createServer(function execute(request, response){});
var io = require('socket.io').listen(app);

var eth = new Eth('ws://127.0.0.1:8545');
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

console.log("Listening on 8090");
app.listen(8090);
