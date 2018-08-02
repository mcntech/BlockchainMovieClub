
import React, { Component } from "react";

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./MovieMaker.css";
//import { subscribeClntRequest, sendEthRequest, sendEthGetAccount, sendEthCall } from '.../../ethlite/Api';
import Ethlite from '../../ethlite/Api';
import bcmc from '../../contracts/bcmc.json';
import coder from 'web3-eth-abi';

const EthereumTx = require('ethereumjs-tx');
const privateKey = Buffer.from('6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1', 'hex'); //test key
const publicKey = Buffer.from('ffcf8fdee72ac11b5c542428b35eef5769c409f0', 'hex');
const contractAddress = Buffer.from('cfeb869f69431e42cdb54a4f4f105c19c080a601', 'hex');
		
<link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />

class MovieMaker extends Component {
 
	
 constructor(props) {
    super(props);
    this.state = {movieAddr: 'Select Movie Address', 
    		      MovieMakerAccount: publicKey.toString('hex'),
    		      MoviePricePerView: '4',
    		      MovieStorageUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"};

    this.handleChangeMovieMakerAccount = this.handleChangeMovieMakerAccount.bind(this);
    this.handleSubmitMovieMakerAccount = this.handleSubmitMovieMakerAccount.bind(this);
    
    this.handleChangeMovieUrl = this.handleChangeMovieUrl.bind(this);
    this.handleChangeMoviePrice = this.handleChangeMoviePrice.bind(this);
    
    this.ethlite = new Ethlite(this, function(obj, event, data)  {
    	console.log("callback event=:" + event +" data=" + data);
    	if(event == 'account_nonce') {
    		console.log("callback: account_nonce" + data);
    		obj.handleSubmitMovieMakerAccountDeferred(data);
    	}
    });
  }

 handleChangeMovieUrl(event)
 {
	 this.setState({MovieStorageUrl: event.target.value}) 
 }
 
 handleChangeMoviePrice(event)
 {
	 
 }
 
 handleChangeMovieMakerAccount(event) {

 }


  handleSubmitMovieMakerAccount(event) {
		event.preventDefault(); 
		console.log("handleSubmitMovieMakerAccount");
		this.ethlite.sendEthGetAccount('0x' + publicKey.toString('hex'));
  }
  
  handleSubmitMovieMakerAccountDeferred(account_nonce) {
	console.log("handleSubmitMovieMakerAccountDeferred=:" + account_nonce);
	console.log(bcmc.abi[1]);
	var codedCall = coder.encodeFunctionCall(bcmc.abi[1], [this.state.MovieStorageUrl, this.state.MoviePricePerView, '0x00']);
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

  render() {

	return (
		<div className={s.root}>
		  <div className={s.container}>
		      <h1 className="Advertiser-title">Movie Registration</h1>
		      <h2>(Demo Screen)</h2>

		  
		    <form onSubmit={this.handleSubmitMovieMakerAccount}>
		      <div className={s.formGroup}>
					<label className={s.label} htmlFor="account">
					     Movie Account :
					     <input type="text" 
					    	 className={s.input}
					    	 id="account"
					    	 name="account"
					    	 value={this.state.MovieMakerAccount} 
					         onChange={this.handleChangeMovieMakerAccount} />
					     <br/>(Ethereum Account)
					 </label>
			  </div>
              <br/>
              <div className={s.formGroup}>
	              <label className={s.label} htmlFor="url">
	                 Movie Location:
	 	             <input 
	 	               className={s.input}   
	 	               type="text" 
	 	                id="url" 
	 	                name="url" 
	 	                value={this.state.MovieStorageUrl} 
	                    onChange={this.handleChangeMovieUrl} />
	                 <br/>(Example: http://myfilm.myserver.com)
	              </label>
              </div>
              <br/>
              <div className={s.formGroup}>
	              <label className={s.label} htmlFor="price">
	                 Price per View($):
			         <input 
			            className={s.input}
			            type="text" 
			            id="price"
			            name	="price"
			            value={this.state.MoviePricePerView} 
	                    onChange={this.handleChangeMoviePrice} />
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

export default withStyles(s)(MovieMaker);

