
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

function findUrllForAccount(items, account) {
	for(var i = 0; i < items.size; i++) {
      if(items.get(i).item.account == account)
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
	    this.handleSubmitMovieSelection = this.handleSubmitMovieSelection.bind(this);
	    this.getTotalMovies = this.getTotalMovies.bind(this);
	    this.getMovie = this.getMovie.bind(this);
	    this.updateMovieList = this.updateMovieList.bind(this);
	    
	    this.ethlite = new Ethlite(this, function(obj, event, data)  {
	    	console.log("callback event=:" + event +" data=" + data);
	    	if(event == 'account_nonce') {
	    		obj.handleSubmitPlayerAccountDeferred(data);
	    	}
	       	if (event == 'eth_call_response') {
	    		var resp = JSON.parse(data);
	    		var result = resp.result;
	    		var cmd = resp.cmd;
	    		if(cmd == 'getMovie') {
	    			var id = findAbiIdForFunction(bcmc.abi, "getMovieUrl");
	    			var index = obj.state.movieReqIndex;
	    			var outputs = coder.decodeParameters(bcmc.abi[id]["outputs"], result);
		    		var movieStr = outputs[0];
		    		console.log(movieStr)
		    		
		    		var movieObj = JSON.parse(movieStr);
		    		
		    		var movieUrl = movieObj.sources[0];
		    		var thumbUrl = movieObj.thumb;
		    		
		    		if (thumbUrl.indexOf('http://') === 0 || thumbUrl.indexOf('https://') === 0) {
		    		    //do nothing
		    		} else {
		    			thumbUrl =  movieUrl.substr(0,movieUrl.lastIndexOf('/') + 1).concat(movieObj.thumb);
		    		}
		    		obj.setState({playerSource:movieUrl})
		       		console.log("url:" + movieUrl);
		    		
		       		var itemData = {
		       			"category": "Drama",
		                "title": movieObj.title,
		                "text": movieObj.description,
		                "image":  thumbUrl,
		                "url"  : movieUrl,
		                "account":index
	                }
		       		const {dispatch} = obj.props;
		       		var data = {item : itemData, itemId: itemData.account}
			    	dispatch(AddItem(data));
		       		obj.setState({movieReqIndex:index+1}); 
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
	  var id = findAbiIdForFunction(bcmc.abi, "getMovieUrl");
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
		var request = {cmd:"getMovie", calldata: callObj}
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
	
	this.ethlite.sendEthRequest('0x' + serializedTx.toString('hex'));
	console.log('0x' + serializedTx.toString('hex'));
  }

  handleSubmitMovieSelection(itemId) {
	  console.dir("itemId=" + itemId)
  }

  onMovieSelection(account){
	var url = findUrllForAccount(this.props.items, account);
		  console.log("onMovieSelection" + account + " url=" + url);
	      this.setState({movieAccount: account});
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

class Button extends React.Component {
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
	        <h2>{this.props.title}</h2>
	        <p className="body-content"> {this.props.text}</p>
	        <Button itemId={this.props.itemId}/>
	      </div>
	    )
	  }
	}

class Card extends React.Component {
	  render() {
		return (
	      <article className="card">
	        <CardHeader category={this.props.details.category} image={this.props.details.image} />
	        <CardBody title={this.props.details.title} text={this.props.details.text}  itemId={this.props.details.account}/>
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
