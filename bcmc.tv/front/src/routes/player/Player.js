
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
	   ,AddItem,Remtem,itemsIsLoading, itemsFetchDataSuccess} from './actions/action'

const TestCards = [
                   {
                     "category": "News",
                     "title": "CNN Acquire BEME",
                     "text": "CNN purchased Casey Neistat's Beme app for $25million.",
                     "image": "https://source.unsplash.com/user/erondu/600x400",
                     "account":'10f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   },
                   {
                     "category": "Travel",
                     "title": "Nomad Lifestyle",
                     "text": "Learn our tips and tricks on living a nomadic lifestyle",
                     "image": "https://source.unsplash.com/user/_vickyreyes/600x400",
                     "account":'20f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   },
                   {
                     "category": "Development",
                     "title": "React and the WP-API",
                     "text": "The first ever decoupled starter theme for React & the WP-API",
                     "image": "https://source.unsplash.com/user/ilyapavlov/600x400",
                     "account":'30f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   },
                   {
                     "category": "News",
                     "title": "CNN Acquire BEME",
                     "text": "CNN purchased Casey Neistat's Beme app for $25million.",
                     "image": "https://source.unsplash.com/user/erondu/600x400",
                     "account":'40f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   },
                   {
                     "category": "Travel",
                     "title": "Nomad Lifestyle",
                     "text": "Learn our tips and tricks on living a nomadic lifestyle",
                     "image": "https://source.unsplash.com/user/_vickyreyes/600x400",
                     "account":'50f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   },
                   {
                     "category": "Development",
                     "title": "React and the WP-API",
                     "text": "The first ever decoupled starter theme for React & the WP-API",
                     "image": "https://source.unsplash.com/user/ilyapavlov/600x400",
                     "account":'90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                   }
                 ]


const mapStateToProps = (state = {}) => {
    return {...state};
};


class Player extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
    		movieAddr: 'Select Movie Address', 
    		playerAccount: publicKey.toString('hex'), 
    		playerSource: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
	    };
	    
	    this.handleChangeMovieAddr = this.handleChangeMovieAddr.bind(this);
	    this.handleSubmitMovieAddr = this.handleSubmitMovieAddr.bind(this);
	    this.handleChangePlayerAccount = this.handleChangePlayerAccount.bind(this);
	    this.handleSubmitPlayerAccount = this.handleSubmitPlayerAccount.bind(this);
	    this.handleSubmitMovieSelection = this.handleSubmitMovieSelection.bind(this);
	    
	    this.ethlite = new Ethlite(this, function(obj, event, data)  {
	    	console.log("callback event=:" + event +" data=" + data);
	    	if(event == 'account_nonce') {
	    		obj.handleSubmitPlayerAccountDeferred(data);
	    	}
	       	if(event == 'eth_call_result') {
	       		var url = coder.decodeParameters(bcmc.abi[9]["outputs"], data);
	       		obj.setState({playerSource: url[0]})
	       		console.log("url:" + url[0]);
	       		var itemData = {
	       			"category": "Drama",
	                "title": "Random Movie",
	                "text": "First Blcochain Movie Screening. Coming soon",
	                "image":  "https://source.unsplash.com/user/erondu/600x400",
	                "url"  : url[0].toString(),
	                "account":'40f8bf6a479f320ead074411a4b0e7944ea8c9c1'
                }
	       		const {dispatch} = obj.props;
	       		var data = {item : itemData, itemId: itemData.account}
		    	dispatch(AddItem(data));
	    	}
	    });
    }

    componentWillMount() {
	     const {dispatch,items} = this.props;
	     
	     dispatch(itemsIsLoading(true));
	     
	  {/*   
	     for (var i of TestCards) {
	    	 var data = {item : i, itemId: i.account}
	    	 dispatch(AddItem(data));
	     }
	     */}
	    dispatch(itemsIsLoading(false));
	    console.dir(items);
    }

  handleChangePlayerAccount(event) {
    this.setState({playerAccount: event.target.playerAccount});
  }

  handleChangeMovieAddr(e) {

  }

  handleSubmitMovieAddr(event) {
	  event.preventDefault(); 
	  var movieAddr = Buffer.from('ffcf8fdee72ac11b5c542428b35eef5769c409f0', 'hex');
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
	  <div className={s.root}>
	    <div className={s.container}>
		  <div className="Player">
		      <header className="Player-header">
			      <h1 className="Player-title">Demo Player</h1>
	          </header>
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
      <div className="Player-item">
		  <form onSubmit={this.handleSubmitMovieAddr}>
		  
			 <div className={s.formGroup}>
			    <label className={s.label} htmlFor="movie">
			    Movie Account:
			    <input 
			      className={s.input}   
			      type="text" 
			      id="movie" 
			      name="movie" 
			      value={this.state.movieAddr} 
			      onChange={this.handleChangeMovieAddr} />
			   <br/>(Ethereum Account)
			    </label>
			</div>
			<button className={s.button} type="submit" >
			  Buy
			</button>
          </form>
	   </div>
	   <br/>
	   <div>
	        <VideoPlayer playsInline fluid={false}  width={320} height={180}>
			   <source src={this.state.playerSource} />
			   </VideoPlayer>
	   </div>
	   
	</div>
   </div>
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
	      <button className="button button-primary" onClick={() => this.fireClick(itemId)}>
	        <i className="fa fa-chevron-right"></i> Select Movie
	      </button>
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

// export connect(mapStateToProps)(Player);
//export default withStyles(s)(Player);
export default connect(mapStateToProps)(withStyles(s)(Player));
