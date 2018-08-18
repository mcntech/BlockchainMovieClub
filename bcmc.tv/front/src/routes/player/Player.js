
import React, { Component } from "react";
import { Player as VideoPlayer } from 'video-react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./Player.css";
//import { subscribeClntRequest, sendEthRequest, sendEthGetAccount, sendEthCall } from '.../../ethlite/Api';
import Ethlite from '../../ethlite/Api';
import {publicKeyOfPrivateKey, decryptWithPrivateKey} from '../../ethlite/drmclnt';
import bcmc from '../../contracts/bcmc.json';
import coder from 'web3-eth-abi';
import {connect} from 'react-redux'
import ReactPlayer from 'react-player'

const EthereumTx = require('ethereumjs-tx');
const privateKey = Buffer.from('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', 'hex'); //test key
const account = Buffer.from('90f8bf6a479f320ead074411a4b0e7944ea8c9c1', 'hex');
const contractAddress = Buffer.from('cfeb869f69431e42cdb54a4f4f105c19c080a601', 'hex');
		
//<link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />
import "../../../node_modules/video-react/dist/video-react.css";

import {loadInitialDataSocket,addNewItemSocket,remItemCompleteSocket
	   ,AddItem,Remtem,initialItems,itemsIsLoading, itemsFetchDataSuccess} from './actions/action'

const mapStateToProps = (state = {}) => {
    return {...state};
};

function findItemForMovieId(items, movieId) {
	for(var i = 0; i < items.size; i++) {
      if(items.get(i).item.movieId == movieId)
        return items.get(i).item;
    }
}

function findAbiIdForFunction(abi, fnName) {
	for(var i = 0; i < abi.length; i++) {
      if(abi[i].type == "function" && abi[i].name == fnName)
        return i;
    }
	return -1;
}

const Context = React.createContext();
class Player extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	totalMovies:0,
    		playerAccount: account.toString('hex'), 
    		//playerSource: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    		playerSource: null,//"https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_ClearKey.mpd",
    		protData: null,//{ "org.w3.clearkey": {"clearkeys": { "nrQFDeRLSAKTLifXUIPiZg": "FmY0xnWCPCNaSpRG-tUuTQ"}}},
    		playing: false //true
	    };
    	this.movieReqIndex = 0;
	    this.handleSubmitMovieUpdate = this.handleSubmitMovieUpdate.bind(this);
	    this.handleChangePlayerAccount = this.handleChangePlayerAccount.bind(this);
	    this.handleSubmitPlayerAccount = this.handleSubmitPlayerAccount.bind(this);

	    this.onMovieSelection = this.onMovieSelection.bind(this);
	    
	    this.onMoviePurchase = this.onMoviePurchase.bind(this);
	    this.handleSubmitPurchaseDeferred = this.handleSubmitPurchaseDeferred.bind(this);
	    this.getMovieDrm = this.getMovieDrm.bind(this);
	    
	    this.getTotalMovies = this.getTotalMovies.bind(this);
	    this.getMovie = this.getMovie.bind(this);
	    this.updateMovieList = this.updateMovieList.bind(this);
	    this.startMovie = this.startMovie.bind(this); 
	    this.stopMovie = this.stopMovie.bind(this);
	    
	    this.deferredEthTransaction = null;
	    this.ethlite = new Ethlite(this, function(obj, event, data)  {
	    	console.log("callback event=:" + event +" data=" + data);
	    	if(event == 'account_nonce') {
	    		//obj.handleSubmitPlayerAccountDeferred(data);
	    		if(obj.deferredEthTransaction)
	    			obj.deferredEthTransaction(data);
	    	}
	       	if (event == 'eth_call_response') {
	    		var resp = JSON.parse(data);
	    		var result = resp.result;
	    		var cmd = resp.cmd;
	    		if(cmd == 'getMovieData') {
		    		try{

		    			var fnId = findAbiIdForFunction(bcmc.abi, "getMovieData");
		    			//var movieId = obj.state.movieReqIndex;
		    			var movieId = obj.movieReqIndex;
		    			var outputs = coder.decodeParameters(bcmc.abi[fnId]["outputs"], result);
			    		var movieUrl = outputs[0];
			    		var movieThumb = outputs[1];
			    		var movieTitle = outputs[2];
			    		var movieDescript = outputs[3];
			    		
			    		var moviePrice = outputs[4];
			    		var movieDuration = outputs[5];
			    		var movieDrmType = outputs[6];
			    		var movieDrmStatus = outputs[7];
		    						    		
			    		/// Obtain thumb url from relative or absolute path
			    		if (movieThumb.indexOf('http://') === 0 || movieThumb.indexOf('https://') === 0) {
			    		    //do nothing
			    		} else {
			    			movieThumb =  movieUrl.substr(0,movieUrl.lastIndexOf('/') + 1).concat(movieThumb);
			    		}
			    		
			    		/// Create movie object
			       		var movieData = {
			       			"category": "Drama",
			                "title": movieTitle,
			                "text": movieDescript,
			                "image":  movieThumb,
			                "url"  : movieUrl,
			                "price" : moviePrice,
			                "duration" : movieDuration,
			                "drmtype" : movieDrmType,
			                "movieId":movieId,
			                "drmstatus" : movieDrmStatus
		                }
			       		console.log('movieData:'); console.log(movieData);
			       		/// Dispatch movie to store
			       		const {dispatch} = obj.props;
				    	dispatch(AddItem(movieId, movieData));
		    		} catch (err) {
		    			console.log(err);
		    		}
		       		//obj.setState({movieReqIndex:movieId+1}); 
		    		obj.movieReqIndex = movieId+1;
	    		
	    		} else if (cmd == 'getMovieDrm'){
		    		try{
		    			var fnId = findAbiIdForFunction(bcmc.abi, "getMovieDrm");
		    			var outputs = coder.decodeParameters(bcmc.abi[fnId]["outputs"], result);
			    		var _movieid = outputs[0];
			    		var _cgms = outputs[1];
			    		var _drmToken = outputs[2];
			    		console.log(`movieid:${_movieid} cgms:${_cgms} drm:${_drmToken} privateKey: ${privateKey.toString('hex')}`);
			    		decryptWithPrivateKey(privateKey, JSON.parse(_drmToken)).then( _drmDecToken => {
				    		var item = findItemForMovieId(obj.props.items, _movieid);
				    		if(item != null) {
				    			console.log('_drmDecToken');console.log(_drmDecToken);
				    			var drmDecToken = JSON.parse(_drmDecToken);
				    			obj.startMovie(item.url, drmDecToken);
				    		}
			    		});
		    		} catch (err) {
		    			console.log(err);
		    		}
	    		} else if (cmd == 'totalMovies'){
	    			var id = findAbiIdForFunction(bcmc.abi, "totalMovies");
	    			var outputs = coder.decodeParameters(bcmc.abi[id]["outputs"], result);
	    			obj.setState({totalMovies: parseInt(outputs[0], 16)});
	    		}
	    	}
	    });
    }

    componentWillMount() {
	     const {dispatch,items} = this.props;
	     
	     dispatch(itemsIsLoading(true));
	     this.getTotalMovies();
	     
	    dispatch(itemsIsLoading(false));
	    console.dir(items);
    }



  handleChangePlayerAccount(event) {
    this.setState({playerAccount: event.target.playerAccount});
  }

  
  stopMovie()
  {
	  this.setState({playerSource: null});
	  /*if(typeof this.player != undefined &&  this.player!= null) {
		  console.log(this.player);
		  if(typeof this.player.stop == 'function')
			  this.player.stop();
	  }*/
	  
  }
  startMovie (url, drmToken)
  {
	console.log('drmToken');console.log(drmToken);
	
	this.stopMovie();
	
	if(drmToken != null) {
		this.setState({protData: drmToken});
	}
	this.setState({playerSource: url});
  }
  
  getTotalMovies() {
	  //event.preventDefault(); 

	    var id = findAbiIdForFunction(bcmc.abi, "totalMovies");
	    console.log(bcmc.abi[id]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[id]);
		console.log("codedCall:" + codedCall);
		
		const callObj = {
			  from:'0x' + this.state.playerAccount.toString('hex'), 
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: '0x00', 
			  data: codedCall,
		}
		var request = {cmd:"totalMovies", calldata: callObj}
		this.ethlite.sendEthCallRequest(JSON.stringify(request))
  }

 getMovie(index)
 { 
	  var id = findAbiIdForFunction(bcmc.abi, "getMovieData");
	  var movieIndex = index;
		console.log(bcmc.abi[id]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[id], [movieIndex.toString(16)]);
		console.log("codedCall:" + codedCall);
		
		const callObj = {
			  from:'0x' + this.state.playerAccount.toString('hex'), 
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: '0x00', 
			  data: codedCall,
		}
		var request = {cmd:"getMovieData", calldata: callObj}
		this.ethlite.sendEthCallRequest(JSON.stringify(request))
  }
 
 getMovieDrm(index)
 { 
	  var id = findAbiIdForFunction(bcmc.abi, "getMovieDrm");
	  var movieIndex = index;
		console.log(bcmc.abi[id]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[id], [movieIndex.toString(16)]);
		console.log("codedCall:" + codedCall);
		
		const callObj = {
			  from:'0x' + this.state.playerAccount.toString('hex'), 
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: '0x00', 
			  data: codedCall,
		}
		var request = {cmd:"getMovieDrm", calldata: callObj}
		this.ethlite.sendEthCallRequest(JSON.stringify(request))
  }
  updateMovieList()
  { 
	  this.movieReqIndex = 0;
	  for (var i=0; i < this.state.totalMovies; i++){
		  this.getMovie(i);
	  }
  }
  
  handleSubmitMovieUpdate(event) {
	  const {dispatch} = this.props;
	  event.preventDefault();
	  
	  dispatch(initialItems([]));
	  
	  this.getTotalMovies()
	  this.updateMovieList();
  }

  handleSubmitPlayerAccount(event) {
		event.preventDefault(); 
		
		this.ethlite.sendEthGetAccount('0x' + this.state.playerAccount.toString('hex'));
		
		this.deferredEthTransaction = this.handleSubmitPlayerAccountDeferred;
  }
  
  handleSubmitPlayerAccountDeferred(account_nonce) {
	var fnId = findAbiIdForFunction(bcmc.abi, "registerPlayer");
	console.log(bcmc.abi[fnId]);
	var publicKeyStr = publicKeyOfPrivateKey(privateKey.toString('hex'));
	console.log("publickey:" + publicKeyStr);
	var codedCall = coder.encodeFunctionCall(bcmc.abi[fnId], [ '0x00', '0x00', publicKeyStr]);
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

  
  onMoviePurchase(movieId, price) {
		//event.preventDefault(); 
		this.ethlite.sendEthGetAccount('0x' + this.state.playerAccount.toString('hex'));
		
		this.deferredEthTransaction = this.handleSubmitPurchaseDeferred;
		this.deferredParam1 = movieId; //todo
		this.deferredParam2 = price; //todo
  }

  handleSubmitPurchaseDeferred(account_nonce) {
		var fnId = findAbiIdForFunction(bcmc.abi, "purchaseMovie");
		console.log(bcmc.abi[fnId]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[fnId], [this.deferredParam1.toString(16)]);
		console.log("codedCall:" + codedCall);
			
		const txParams = {
			  nonce: account_nonce,
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: this.deferredParam2.toString(16), 
			  data: codedCall,
		}
		
		const tx = new EthereumTx(txParams);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();
		
		this.ethlite.sendEthRequest('0x' + serializedTx.toString('hex'));
		console.log('0x' + serializedTx.toString('hex'));
  }
  
  onMovieSelection(movieId){
	var item = findItemForMovieId(this.props.items, movieId);
    if(item != null) {
		console.log("onMovieSelection" + movieId + " url=" + item.url + ' drmtype=' + item.drmtype);
	    
		if(item.drmtype == 1) {
			this.getMovieDrm(movieId);
		} else {
			// this.setState({playerSource:item.url});
			this.startMovie(item.url, null);
		}
    }
  }
 

  ref = player => {
	    this.player = player
  }
  
  render() {
	
	const {dispatch,items,isLoading,hasErrored} = this.props
	//console.dir(this.props);
	//console.dir(items);
	var i;
	var tmp = [];
	for ( i=0; i < items.size; i++){ tmp.push(items.get(i).item);}
	
	if (hasErrored) {
	      return <p>Sorry! There was an error loading the items</p>;
	}
	
	if (isLoading) {
	      return <p>Loading…</p>;
	}

	return (
	 <Context.Provider value={this}>
	  <div className={s.root}>
	    <div className={s.container}>
		  <div className="Player">
		      <header className="Player-header">
			      <h1 className="Player-title">Demo Player</h1>
	          </header>
		   	  <div>
				   <ReactPlayer     
				   		ref={this.ref}
				   		width='100%'
			            height='100%'
			            url={this.state.playerSource}
				   		protdata = {this.state.protData}
				   		playing={this.state.playing} 
				   		controls={true} />
					  
	          </div>
		
			  <PlayControls enable={this.state.playerSource != null} />
	          <form onSubmit={this.handleSubmitPlayerAccount}>
			     
				 <div className={s.formGroup}>
				    <label className={s.label} htmlFor="account">
				    Player Account:
				    <input 
				      className={s.input}   
				      type="text" 
				      id="account" 
				      name="account" 
					  value={this.state.playerAccount} 
				      onChange={this.handleChangePlayerAccount} />
				   <br/>(Ethereum Account)
				    </label>
				</div>
			  <button className={s.button} type="submit">
			    Register
			  </button>
		    </form>
	  </div>

	  <div className="app-card-list" id="app-card-list">
	    {
	    	tmp.map((item, key) => <Card key={key} index={key} details={item} />)
	    }
	  </div>
	  <br/>
      <div className="Player-item">
		  <form onSubmit={this.handleSubmitMovieUpdate}>
			<button className={s.button} type="submit" >
			  Update Movies List
			</button>
          </form>
	   </div>
	   <br/>
	</div>
   </div>
   </Context.Provider>
   );
	
  }
}

class PlayControls extends React.Component {
	render() {
		if(this.props.enable){
			return (
				<Context.Consumer>
				{(context) => <button onClick={() => context.stopMovie()}> Stop</button>}
			</Context.Consumer>
			)
		} else {
			return null;
		}
	}
}

class ButtonSelect extends React.Component {
	fireClick(itemId) {
		console.dir("Im an alert " + itemId);
	}  
	render() {
		const {itemId} = this.props;
	    return (
	     <Context.Consumer>
	     {(context) => <button className="button button-primary" onClick={() => {this.fireClick(itemId); context.onMovieSelection(itemId)}}>
	        <i className="fa fa-chevron-right"></i> Select Movie
	      </button>}
	     </Context.Consumer>
	   )
   }
}

class ButtonPurchase extends React.Component {
	fireClick(itemId, price) {
		console.dir('ButtonPurchase:fireClick id:' + itemId + ' price:' + price);
	}  

	render() {
		const {itemId, price} = this.props;
	    return (
	     <Context.Consumer>
	     {(context) => <button className="button button-primary" onClick={() => {this.fireClick(itemId, price); context.onMoviePurchase(itemId, price)}}>
	        <i className="fa fa-chevron-right"></i> Purchase
	      </button>}
	     </Context.Consumer>
	   )
   }
}

class CardHeader extends React.Component {
	  render() {
	    const { image, category } = this.props.details;
	    var style = { 
	        backgroundImage: 'url(' + image + ')',
	        width: "100%",
	        height: "200px",
	    };
	    return (
	      <header style={style} className="card-header">
	        <h4 className="card-header--title">{category}</h4>
	      </header>
	    )
	  }
	}


	class CardBody extends React.Component {
	  render() {
		  return (
	      <div className="card-body">
	        <h2>{this.props.details.title}</h2>
	        <p className="body-content"> {this.props.details.text}</p>
	        <p className="body-content"> Duration: {this.props.details.duration} Price:{this.props.details.price} DRM:{this.props.details.drmtype}  DRM Status:{this.props.details.drmstatus}</p>
	        <ButtonSelect itemId={this.props.details.movieId}/>
	        <ButtonPurchase itemId={this.props.details.movieId} price={this.props.details.price}/>
	      </div>
	    )
	  }
	}

class Card extends React.Component {
	  render() {
		return (
	      <article className="card">
	        <CardHeader details={this.props.details} />
	        <CardBody details={this.props.details}/>
	      </article>
	    )
	  }
	}

// export connect(mapStateToProps)(Player);
//export default withStyles(s)(Player);
export default connect(mapStateToProps)(withStyles(s)(Player));
