
import React, { Component } from "react";
import { Player as VideoPlayer } from 'video-react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./Player.css";
//import { subscribeClntRequest, sendEthRequest, sendEthGetAccount, sendEthCall } from '.../../ethlite/Api';
import Ethlite from '../../ethlite/Api';
import bcmc from '../../contracts/bcmc.json';
import coder from 'web3-eth-abi';
import {connect} from 'react-redux'

const EthereumTx = require('ethereumjs-tx');
const privateKey = Buffer.from('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', 'hex'); //test key
const publicKey = Buffer.from('90f8bf6a479f320ead074411a4b0e7944ea8c9c1', 'hex');
const contractAddress = Buffer.from('cfeb869f69431e42cdb54a4f4f105c19c080a601', 'hex');
		
//<link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />
import "../../../node_modules/video-react/dist/video-react.css";

import {loadInitialDataSocket,addNewItemSocket,remItemCompleteSocket
	   ,AddItem,Remtem,initialItems,itemsIsLoading, itemsFetchDataSuccess} from './actions/action'

const mapStateToProps = (state = {}) => {
    return {...state};
};

function findUrllForMovieId(items, movieId) {
	for(var i = 0; i < items.size; i++) {
      if(items.get(i).item.movieId == movieId)
        return items.get(i).item.url;
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
	    	movieReqIndex:0,
    		playerAccount: publicKey.toString('hex'), 
    		playerSource: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
	    };
	    
	    this.handleSubmitMovieUpdate = this.handleSubmitMovieUpdate.bind(this);
	    this.handleChangePlayerAccount = this.handleChangePlayerAccount.bind(this);
	    this.handleSubmitPlayerAccount = this.handleSubmitPlayerAccount.bind(this);

	    this.onMovieSelection = this.onMovieSelection.bind(this);
	    
	    this.onMoviePurchase = this.onMoviePurchase.bind(this);
	    this.handleSubmitPurchaseDeferred = this.handleSubmitPurchaseDeferred.bind(this);
	    
	    this.getTotalMovies = this.getTotalMovies.bind(this);
	    this.getMovie = this.getMovie.bind(this);
	    this.updateMovieList = this.updateMovieList.bind(this);
	    
	    
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
		    			var movieId = obj.state.movieReqIndex;
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
			    		obj.setState({playerSource:movieUrl})
			       		console.log("url:" + movieUrl);
			    		
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
			       		
			       		/// Dispatch movie to store
			       		const {dispatch} = obj.props;
				    	dispatch(AddItem(movieId, movieData));
		    		} catch (err) {
		    			console.log(err);
		    		}
		       		obj.setState({movieReqIndex:movieId+1}); 
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

  
  getTotalMovies() {
	  //event.preventDefault(); 

	    var id = findAbiIdForFunction(bcmc.abi, "totalMovies");
	    console.log(bcmc.abi[id]);
		var codedCall = coder.encodeFunctionCall(bcmc.abi[id]);
		console.log("codedCall:" + codedCall);
		
		const callObj = {
			  from:'0x' + publicKey.toString('hex'), 
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
			  from:'0x' + publicKey.toString('hex'), 
			  gasPrice: '0x09184e72a000', 
			  gasLimit: '0x271000',
			  to: '0x' + contractAddress.toString('hex'), 
			  value: '0x00', 
			  data: codedCall,
		}
		var request = {cmd:"getMovieData", calldata: callObj}
		this.ethlite.sendEthCallRequest(JSON.stringify(request))
  }
 
  updateMovieList()
  { 
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
		
		this.ethlite.sendEthGetAccount('0x' + publicKey.toString('hex'));
		
		this.deferredEthTransaction = this.handleSubmitPlayerAccountDeferred;
  }
  
  handleSubmitPlayerAccountDeferred(account_nonce) {
	var fnId = findAbiIdForFunction(bcmc.abi, "registerPlayer");
	console.log(bcmc.abi[fnId]);
	var codedCall = coder.encodeFunctionCall(bcmc.abi[fnId], [ '0x00', '0x00', '0x' + publicKey.toString('hex')]);
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

  
  onMoviePurchase(movieId) {
		//event.preventDefault(); 
		this.ethlite.sendEthGetAccount('0x' + publicKey.toString('hex'));
		
		this.deferredEthTransaction = this.handleSubmitPurchaseDeferred;
		this.deferredParam1 = movieId; //todo
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
			  value: '0x00', 
			  data: codedCall,
		}
		
		const tx = new EthereumTx(txParams);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();
		
		this.ethlite.sendEthRequest('0x' + serializedTx.toString('hex'));
		console.log('0x' + serializedTx.toString('hex'));
  }
  
  onMovieSelection(movieId){
	var url = findUrllForMovieId(this.props.items, movieId);
    console.log("onMovieSelection" + movieId + " url=" + url);
    this.setState({playerSource:url});
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
	           {/*<VideoPlayer playsInline fluid={false}  width={320} height={180} src={this.state.playerSource} />*/}
			   <Video src={this.state.playerSource}/>
             </div>

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
	fireClick(itemId) {
		console.dir("Im an alert " + itemId);
	}  
	render() {
		const {itemId} = this.props;
	    return (
	     <Context.Consumer>
	     {(context) => <button className="button button-primary" onClick={() => {this.fireClick(itemId); context.onMoviePurchase(itemId)}}>
	        <i className="fa fa-chevron-right"></i> Purchase
	      </button>}
	     </Context.Consumer>
	   )
   }
}

class CardHeader extends React.Component {
	  render() {
	    const { image, category } = this.props;
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
	        <ButtonSelect itemId={this.props.details.itemId}/>
	        <ButtonPurchase itemId={this.props.details.itemId}/>
	      </div>
	    )
	  }
	}

class Card extends React.Component {
	  render() {
		return (
	      <article className="card">
	        <CardHeader category={this.props.details.category} image={this.props.details.image} />
	        <CardBody details={this.props.details} title={this.props.details.title} text={this.props.details.text}  itemId={this.props.details.movieId}/>
	      </article>
	    )
	  }
	}


class Video extends React.Component {
	  playVideo() {
	    // You can use the play method as normal on your video ref
	    this.refs.vidRef.play();
	  }
	  
	  pauseVideo() {
	    // Pause as well
	    this.refs.vidRef.pause();
	  }
	  
	  // You can pass your function references to your child components as props (here passing down to the Buttons component)
	  render() {
		  var src = this.props.src;
		return(
	      <div>
	        <video ref="vidRef" width="380" height="240" src={src} type="video/mp4" controls></video>
	        <Buttons playVideo={this.playVideo.bind(this)} pauseVideo={this.pauseVideo.bind(this)} />
	      </div>
	    );
	  }
	}

	// You can then call the parent play/pause methods from your child component.
	class Buttons extends React.Component {
	  render(){
	    return(
	      <div>
	        <button id='playButton' onClick={this.props.playVideo}>Play!</button>
	        <button id='pauseButton' onClick={this.props.pauseVideo}>Pause!</button>
	      </div>
	    );
	  }
	}
// export connect(mapStateToProps)(Player);
//export default withStyles(s)(Player);
export default connect(mapStateToProps)(withStyles(s)(Player));
