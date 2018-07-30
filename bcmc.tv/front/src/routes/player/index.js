
import React from 'react';
import Layout from '../../components/Layout';
import Player from './Player';

const title = 'Demo Player';

function action() {
  
  return {
    chunks: ['player'],
    title,
    component: (
      <Layout>
        <Player title={title} />
      </Layout>
    ),
  };
}

export default action;