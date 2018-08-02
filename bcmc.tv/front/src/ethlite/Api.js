import openSocket from 'socket.io-client';

//import {loadInitialDataSocket,addNewItemSocket,remItemCompleteSocket
//	   ,AddItem,Remtem} from './actions/action'
	   
class Ethlite
{
	constructor(_clientObj, _cb) {
		this.clientObj = _clientObj;
		this.cb = _cb;
		this.socket = openSocket('http://localhost:8090');

	  this.socket.on('general_event', data => { 
		  console.log("general_event" + data); 
		  this.cb(this.clientObj, 'general_event', data)
	  });
	  
	  this.socket.on('account_nonce', data => { 
		  console.log("account_nonce:" + data); 
		  this.cb(this.clientObj, 'account_nonce', data)
	  });
	  this.socket.on('eth_call_result', data => { 
		  console.log("eth_call_result:" + data); 
		  this.cb(this.clientObj, 'eth_call_result', data)
	  });

	}
	/*
	setMovieListUpdation()
	{
	   socket.on('movieAdded',(res)=>{
		   console.log(res)
		   dispatch(AddItem(res))
	   })

	   socket.on('movieDeleted',(res)=>{
		   console.log(res)
		   dispatch(RemItem(res))
	   })
	}*/
    sendEthRequest(data)
	{
	  console.log("sendEthRequest=:" + data);
	  this.socket.emit("eth_rawtransaction", data);
	}

	sendEthGetAccount(account)
	{
	  console.log("sendEthGetAccount=:" + account);
	  this.socket.emit("eth_get_account", account);
	}

	sendEthCall(data)
	{
	  console.log("sendEthCall=:" + data);
	  this.socket.emit("eth_call", data);
	}
}
export  default Ethlite ;
