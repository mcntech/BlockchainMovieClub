import React, { Component } from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MovieMaker.css';
// import { subscribeClntRequest, sendEthRequest, sendEthGetAccount, sendEthCall } from '.../../ethlite/Api';
import Ethlite from '../../ethlite/Api';
import bcmc from '../../contracts/bcmc.json';
import bcmc_config from '../../contracts/bcmc_config.json';
import coder from 'web3-eth-abi';
import Popup from 'reactjs-popup';

const EthereumTx = require('ethereumjs-tx');

const privateKey = Buffer.from(
  '6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
  'hex',
); // test key
const publicKey = Buffer.from(
  'ffcf8fdee72ac11b5c542428b35eef5769c409f0',
  'hex',
);
const contractAddress = Buffer.from(bcmc_config.contractAddress, 'hex');
//const contentEncKey = 'F20DF10DF10DF10DF10DF10DF10DF10D';
const contentEncKey = '{ "org.w3.clearkey": {"clearkeys": { "nrQFDeRLSAKTLifXUIPiZg": "FmY0xnWCPCNaSpRG-tUuTQ"}}}'
const testEthNode = 'http://rpc.zeeth.io';

const remoteEthNode = 'http://rpc.zeeth.io';
const localEthNode = 'http://localhost:8090';

const GASS_PRICE = '0x01000000000';
const DemoClipNonDrm = {
  MovieTitle: 'Big Buck Bunny',
  MovieDescription:
    'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself',
  MovieStorageUrl:
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  MovieCoverArtUrl: 'images/BigBuckBunny.jpg',
  MoviePricePerView: '4',
  MovieDuration: '120',
  MovieDrmType: '0',
  MovieDrmId: '0',
  MovieDrmProvider: publicKey.toString('hex'),
  MovieContentEncKey: contentEncKey.toString('hex'),
  MovieMetaData: 'Enter Metadata',
};

const DemoClipDrm = {
  MovieTitle: 'Big Buck Bunny Premium',
  MovieDescription:
    'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself',
  MovieStorageUrl:
    "https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_ClearKey.mpd",
  MovieCoverArtUrl: 'images/BigBuckBunny.jpg',
  MoviePricePerView: '4',
  MovieDuration: '120',
  MovieDrmType: '1',
  MovieDrmId: '123',
  MovieDrmProvider: publicKey.toString('hex'),
  MovieContentEncKey: contentEncKey.toString('hex'),
  MovieMetaData: 'Enter Metadata',
};


<link
  rel="stylesheet"
  href="https://video-react.github.io/assets/video-react.css"
/>;

class MovieMaker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      MovieMakerAccount: publicKey.toString('hex'),
      MovieTitle: 'Big Buck Bunny',
      MovieDescription:
        'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself',
      MovieStorageUrl:
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      MovieCoverArtUrl: 'images/BigBuckBunny.jpg',
      MoviePricePerView: '4',
      MovieDuration: '120',
      MovieDrmType: '0',
      MovieDrmId: '123',
      MovieDrmProvider: publicKey.toString('hex'),
      MovieContentEncKey: contentEncKey.toString('hex'),
      MovieMetaData: 'Enter Metadata',
      EthNode: remoteEthNode,
      EthState: 'Not Connected',
      DemoMovie: DemoClipNonDrm,
      DemoMovieType: "DRM",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitMovieMakerAccount = this.handleSubmitMovieMakerAccount.bind(
      this,
    );
    this.handleSubmitMovieMakerAccountDeferred = this.handleSubmitMovieMakerAccountDeferred.bind(
      this,
    );
    this.handleChangeEthNode = this.handleChangeEthNode.bind(this);
    this.processEthMsg = this.processEthMsg.bind(this);

    this.setEthNode = this.setEthNode.bind(this);
    this.setDemoMovie = this.setDemoMovie.bind(this);
  }

  processEthMsg(obj, event, data) {
    console.log(`callback event=:${event} data=${data}`);
    if (event == 'account_nonce') {
      console.log(`callback: account_nonce${data}`);
      obj.handleSubmitMovieMakerAccountDeferred(data);
    } else if (event == 'status') {
      obj.setState({ EthState: data });
    }
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleSubmitMovieMakerAccount(event) {
    event.preventDefault();
    console.log('handleSubmitMovieMakerAccount');
    this.ethlite.sendEthGetAccount(`0x${publicKey.toString('hex')}`);
  }

  handleChangeEthNode(event) {
    this.setState({ EthNode: event.target.ethNode });
  }

  handleSubmitMovieMakerAccountDeferred(account_nonce) {
    console.log(`handleSubmitMovieMakerAccountDeferred=:${account_nonce}`);
    console.log(bcmc.abi[1]);

    const id = this.ethlite.findAbiIdForFunction(bcmc.abi, 'registerMovie');
    const codedCall = coder.encodeFunctionCall(bcmc.abi[id], [
      this.state.MovieStorageUrl,
      this.state.MovieCoverArtUrl,
      this.state.MovieTitle,
      this.state.MovieDescription,
      this.state.MoviePricePerView,
      this.state.MovieDuration,
      this.state.MovieDrmType,
      this.state.MovieDrmId,
      this.state.MovieDrmProvider,
    ]);

    console.log(`codedCall:${codedCall}`);

    const txParams = {
      nonce: account_nonce,
      gasPrice: GASS_PRICE,
      gasLimit: '0x4271000',
      to: `0x${contractAddress.toString('hex')}`,
      value: '0x00',
      data: codedCall,
    };

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();

    this.ethlite.sendEthRequest(`0x${serializedTx.toString('hex')}`);
    console.log(`0x${serializedTx.toString('hex')}`);

    const request = {
      drmid: this.state.MovieDrmId,
      drmtoken: this.state.MovieContentEncKey,
    };
    // Register DRM provider
    // this.ethlite.sendDrmUpdateEncKey(JSON.stringify(request));
  }

  setEthNode(event, server) {
    event.preventDefault();
    let _ethNode = null;
    if (server == 'local') {
      _ethNode = localEthNode;
    } else if (server == 'remote') {
      _ethNode = remoteEthNode;
    } else if (server == 'custom') {
      _ethNode = localEthNode;
    }
    if (_ethNode != null) {
      this.setState({ EthState: 'Connecting...' });
      this.setState({ EthNode: _ethNode });
      this.ethlite = new Ethlite(this, _ethNode, this.processEthMsg);
    }
  }

  setDemoMovie(event, movie) {
    event.preventDefault();
    let _movie = null;
    let _movieType = null;
    if (movie == 'drm') {
      _movie = DemoClipDrm;
      _movieType = "DRM"
    } else if (movie == 'nondrm') {
      _movie = DemoClipNonDrm;
      _movieType = "No DRM"
    } 
    if (_movie != null) {
      this.setState({ ..._movie, DemoMovieType: _movieType, });
    }
  }
  componentDidMount() {
    this.setState({ EthState: 'Connecting...' });
    this.ethlite = new Ethlite(this, this.state.EthNode, this.processEthMsg);
  }
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h2 align="center" className="Advertiser-title">
            Movie Registration ({this.state.EthState})
          </h2>
          <Popup trigger={<div> Template {this.state.DemoMovieType} </div>} position="bottom center"
	        	 closeOnDocumentClick
	        	 mouseLeaveDelay={300}
	         >
	           <div>
                  <button className={s.button} onClick={e => this.setDemoMovie(e, "nondrm")}> No DRM </button>
                  <button className={s.button} onClick={e => this.setDemoMovie(e, "drm")}> DRM  </button>
	           </div>
	         </Popup>
          <form onSubmit={this.handleSubmitMovieMakerAccount}>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="account">
                Ethereum Account :
                <input
                  type="text"
                  className={s.input}
                  id="account"
                  name="MovieMakerAccount"
                  value={this.state.MovieMakerAccount}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <br />
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="url">
                Title:
                <input
                  className={s.input}
                  type="text"
                  id="url"
                  name="MovieTitle"
                  value={this.state.MovieTitle}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="description">
                Description:
                <input
                  className={s.input}
                  type="text"
                  id="description"
                  name="MovieDescription"
                  value={this.state.MovieDescription}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="url">
                Movie Location:
                <input
                  className={s.input}
                  type="text"
                  id="url"
                  name="MovieStorageUrl"
                  value={this.state.MovieStorageUrl}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="coverart">
                Cover Art Location:
                <input
                  className={s.input}
                  type="text"
                  id="coverart"
                  name="MovieCoverArtUrl"
                  value={this.state.MovieCoverArtUrl}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="price">
                Price per View($):
                <input
                  className={s.input}
                  type="text"
                  id="price"
                  name="MoviePricePerView"
                  value={this.state.MoviePricePerView}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="duration">
                Duration(Minutes):
                <input
                  className={s.input}
                  type="text"
                  id="duration"
                  name="MovieDuration"
                  value={this.state.MovieDuration}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="drmtype">
                DRM Type(0-Disable 1-Enable):
                <input
                  className={s.input}
                  type="text"
                  id="drmtype"
                  name="MovieDrmType"
                  value={this.state.MovieDrmType}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="drmid">
                DRM ID:
                <input
                  className={s.input}
                  type="text"
                  id="drmid"
                  name="MovieDrmId"
                  value={this.state.MovieDrmId}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="drmprovider">
                DRM Provider Account:
                <input
                  className={s.input}
                  type="text"
                  id="drmprovider"
                  name="MovieDrmProvider"
                  value={this.state.MovieDrmProvider}
                  onChange={this.handleChange}
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="contentenkey">
                DRM Content Encypion Key:
                <input
                  className={s.input}
                  type="text"
                  id="contentenkey"
                  name="MovieContentEncKey"
                  value={this.state.MovieContentEncKey}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="metadata">
                Metadata:
                <input
                  className={s.input}
                  type="text"
                  id="metadata"
                  name="MovieMetaData"
                  value={this.state.MovieMetaData}
                  onChange={this.handleChange}
                />
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
