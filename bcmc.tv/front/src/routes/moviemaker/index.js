
import React from 'react';
import Layout from '../../components/Layout';
import MovieMaker from './MovieMaker';

const title = 'Movie Registration (Demo Screen)';

function action() {
  
  return {
    chunks: ['moviemaker'],
    title,
    component: (
      <Layout>
        <MovieMaker title={title} />
      </Layout>
    ),
  };
}

export default action;