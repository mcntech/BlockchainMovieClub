
import React, { Component } from "react";
import { Player } from 'video-react';
import "./App.css";
import { subscribeClntRequest } from './api';
import { sendEthRequest } from './api';
import { sendEthGetAccount } from './api';

import { sendEthCall } from './api';
import bcmc from './contracts/bcmc.json';
import coder from 'web3-eth-abi';

const EthereumTx = require('ethereumjs-tx');
const privateKey = Buffer.from('a26ecf489e39d27a26cc2b1ba7cd8a6ef0256b3e8038fecd07f2a7d0d8983c82', 'hex'); //test key
const publicKey = Buffer.from('47160d1b68c4c21974c9fb96428d8213f48418c9', 'hex');
const contractAddress = Buffer.from('cf4e8fe7eb528aee9ec9a16a4fce87069bf8a253', 'hex');
		
<link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />

class App extends Component {
 constructor(props) {
    super(props);
    this.state = {movieAddr: 'Select Movie Address', playerAccount: 'Select Player acount', playerSource: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"};

    this.handleChangeMovieAddr = this.handleChangeMovieAddr.bind(this);
    this.handleSubmitMovieAddr = this.handleSubmitMovieAddr.bind(this);
    this.handleChangePlayerAccount = this.handleChangePlayerAccount.bind(this);
    this.handleSubmitPlayerAccount = this.handleSubmitPlayerAccount.bind(this);
    
    subscribeClntRequest(this, function(obj, event, data)  {
    	if(event == 'account_nonce')
    		obj.handleSubmitPlayerAccountDeferred(data);
    });
  }

  handleChangePlayerAccount(event) {
    this.setState({playerAccount: event.target.playerAccount});
  }

  handleChangeMovieAddr(event) {

  }

  handleSubmitMovieAddr(event) {
	  
		var movieAddr = Buffer.from('86972749aedd94711edc884a6a0c4bb78abc9612', 'hex');
		console.log(bcmc.abi[9]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[9], [ '0x' + movieAddr.toString('hex')]);
		console.log("codedCall:" + codedCall);
		
		const callObj = {
			  from:'0x' + publicKey.toString('hex'), 
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: '0x00', 
			  data: codedCall,
		}
		sendEthCall(JSON.stringify(callObj))
  }

  handleSubmitPlayerAccount(event) {
		event.preventDefault(); 
		sendEthGetAccount('0x' + publicKey.toString('hex'));
  }
  
  handleSubmitPlayerAccountDeferred(account_nonce) {
	
	console.log(bcmc.abi[2]);
	var codedCall = coder.encodeFunctionCall(bcmc.abi[2], [ '0x' + publicKey.toString('hex'), '0x00', '0x00']);
	console.log("codedCall:" + codedCall);
		
	const txParams = {
		  nonce: account_nonce,
		  gasPrice: '0x09184e72a000', 
		  gasLimit: '0x271000',
		  to: '0x' + contractAddress.toString('hex'), 
		  value: '0x00', 
		  data: codedCall,
	}
	
	const tx = new EthereumTx(txParams);
	tx.sign(privateKey);
	const serializedTx = tx.serialize();
	
	sendEthRequest('0x' + serializedTx.toString('hex'));
	console.log('0x' + serializedTx.toString('hex'));
  }

  render() {

      return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">BlockChain Movie Club</h1>
            <h3>Demo Player</h3>
          </header>
          <div className="App-item">
            <form onSubmit={this.handleSubmitPlayerAccount}>
              <label>
		Player Account:
		<input type="text" value={this.state.playerAccount} onChange={this.handleChangePlayerAccount} />
		<input type="submit" value="Register" />
		</label>
            </form>
          </div>
          <div className="App-item">
            <form onSubmit={this.handleSubmitMovieAddr}>
              <label>
		Name:
		<input type="text" value={this.state.movieAddr} onChange={this.handleChangeMovieAddr} />
		<input type="submit" value="Get Movie" />
		</label>
            </form>
          </div>

           <div>
            <Player fluid={false} playsInline width="320" iheight="240">
		<source src={this.state.playerSource} />
	  </Player>
          </div>
        </div>
      );

  }
}
export default App;
