
import React from 'react';
import Layout from '../../components/Layout';
import Player from './Player';

import { createStore, applyMiddleware } from 'redux'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'


import reducer from './reducers/reducer'
const title = 'Demo Player';
const store = createStore(reducer, applyMiddleware(thunk))

function action() {
  
  return {
    chunks: ['player'],
    title,
    component: (
      <Layout>
        <Provider store={store}>
           <Player title={title} />
        </Provider> 
     </Layout>
    ),
  };
}

export default action;