
import React, { Component } from "react";
import { Player as VideoPlayer } from 'video-react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./Advertiser.css";
//import { subscribeClntRequest, sendEthRequest, sendEthGetAccount, sendEthCall } from '.../../ethlite/Api';
import Ethlite from '../../ethlite/Api';
import bcmc from '../../contracts/bcmc.json';
import coder from 'web3-eth-abi';
import Popup from "reactjs-popup";

const EthereumTx = require('ethereumjs-tx');
const privateKey = Buffer.from('a26ecf489e39d27a26cc2b1ba7cd8a6ef0256b3e8038fecd07f2a7d0d8983c82', 'hex'); //test key
const publicKey = Buffer.from('47160d1b68c4c21974c9fb96428d8213f48418c9', 'hex');
const contractAddress = Buffer.from('cfeb869f69431e42cdb54a4f4f105c19c080a601', 'hex');
const testEthNode = 'http://www.bcmc.tv:8090';

const remoteEthNode = 'http://www.bcmc.tv:8090';
const localEthNode = 'http://localhost:8090';
		
<link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />

class Advertiser extends Component {
 constructor(props) {
    super(props);
    this.state = { 
    		AdvertiserAccount: 'Select Advertiser acount', 
    		SponsorMovie: 'Select Movie Address',
    		SponsorAmount: '10000',
    		AdvertiserSource: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    		EthNode: remoteEthNode,
    		EthState: 'Not Connected',
    };

    this.handleChangeMovieAddr = this.handleChangeMovieAddr.bind(this);
    this.handleSubmitMovieAddr = this.handleSubmitMovieAddr.bind(this);
    this.handleChangeAdvertiserAccount = this.handleChangeAdvertiserAccount.bind(this);
    this.handleSubmitAdvertiserAccount = this.handleSubmitAdvertiserAccount.bind(this);
    this.handleChangeEthNode = this.handleChangeEthNode.bind(this);
    this.processEthMsg = this.processEthMsg.bind(this);
    
    this.setEthNode = this.setEthNode.bind(this);
    
  }

 processEthMsg(obj, event, data)  {
	 	if(event == 'account_nonce') {
	 		obj.handleSubmitAdvertiserAccountDeferred(data);
	 	} else if (event == 'status') {
			obj.setState({EthState: data});
    	}
  }
  handleChangeAdvertiserAccount(event) {
    this.setState({AdvertiserAccount: event.target.AdvertiserAccount});
  }

  handleChangeMovieAddr(event) {

  }

  handleChangeEthNode(event) {
	    this.setState({EthNode: event.target.ethNode});
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
		this.ethlite.sendEthCall(JSON.stringify(callObj))
  }

  handleSubmitAdvertiserAccount(event) {
		event.preventDefault(); 
		this.ethlite.sendEthGetAccount('0x' + publicKey.toString('hex'));
  }
  
  handleSubmitAdvertiserAccountDeferred(account_nonce) {
	
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
	
	this.ethlite.sendEthRequest('0x' + serializedTx.toString('hex'));
	console.log('0x' + serializedTx.toString('hex'));
  }

  setEthNode(event, server) {
      event.preventDefault();
      var _ethNode = null;
      if(server == 'local') {
      	_ethNode = localEthNode;
      } else if(server == 'remote') {
      	_ethNode = remoteEthNode;
      } else if(server == 'custom') {
      	_ethNode = localEthNode;
      }
      if(_ethNode != null) {
      	this.setState({EthState: "Connecting..."});
      	this.setState({EthNode: _ethNode})        
      	this.ethlite = new Ethlite(this, _ethNode, this.processEthMsg);
      }
  }
  
  componentDidMount()
  {
  	this.setState({EthState: "Connecting..."});
  	this.ethlite = new Ethlite(this, this.state.EthNode, this.processEthMsg);
  }
  
  render() {
	  return(
		<div className={s.root}>
		  <div className={s.container}>
		      <h2 className="Advertiser-title">Advertiser Registration({this.state.EthState})</h2>
	         <Popup trigger={<div> {this.state.EthNode}... </div>} position="bottom center"
	        	 closeOnDocumentClick
	        	 mouseLeaveDelay={300}
	         >
	           <div>
                  <button className={s.button} onClick={e => this.setEthNode(e, "remote")}> Remote </button>
                  <button className={s.button} onClick={e => this.setEthNode(e, "local")}> Local </button>
                  <button className={s.button} onClick={e => this.setEthNode(e, "custom")} > Custom </button>
	           </div>
	         </Popup>		  
		    <form onSubmit={this.handleSubmitMovieMakerAccount}>
		      <div className={s.formGroup}>
					<label className={s.label} htmlFor="account">
					     Advertiser Account :
					     <input type="text" 
					    	 className={s.input}
					    	 id="account"
					    	 name="account"
					    	 value={this.state.AdvertiserAccount} />
					     <br/>(Ethereum Account)
					 </label>
			  </div>
			  <div className={s.formGroup}>
			    <label className={s.label} htmlFor="account">
			    Ethereum Node:
			    <input 
			      className={s.input}   
			      type="text" 
			      id="ethnode" 
			      name="ethnode" 
				  value={this.state.EthNode} 
			      onChange={this.handleChangeEthNode} />
			    </label>
		    </div>			  
            <div className={s.formGroup}>
	              <label className={s.label} htmlFor="url">
	                 Ad Location:
	 	             <input 
	 	               className={s.input}   
	 	               type="text" 
	 	                id="url" 
	 	                name="url" 
	 	                value={this.state.AdStorageUrl} />
	                 <br/>(Example: http://myfilm.myserver.com)
	              </label>
            </div>
            <div className={s.formGroup}>
	            <label className={s.label} htmlFor="movie">
	               Sponsoring Movie Account:
			         <input 
			            className={s.input}
			            type="text" 
			            id="movie"
			            name	="movie"
			            value={this.state.SponsorMovie} />
	             </label>
           </div>

            
            <div className={s.formGroup}>
	              <label className={s.label} htmlFor="amount">
	                 Sponsoring Amount($):
			         <input 
			            className={s.input}
			            type="text" 
			            id="amount"
			            name	="amount"
			            value={this.state.SponsorAmount} />
 	              </label>
            </div>
           <div className={s.formGroup}>
	             <button className={s.button} type="submit">
	               Register
	             </button>
	         </div>
	        </form>
	   </div>
	 </div>
	);
	
    }
}

export default withStyles(s)(Advertiser);

