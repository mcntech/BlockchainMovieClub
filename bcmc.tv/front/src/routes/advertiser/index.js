
import React from 'react';
import Layout from '../../components/Layout';
import Advertiser from './Advertiser';

const title = 'Advertiser Registration (Demo)';

function action() {
  
  return {
    chunks: ['advertiser'],
    title,
    component: (
      <Layout>
        <Advertiser title={title} />
      </Layout>
    ),
  };
}

export default action;