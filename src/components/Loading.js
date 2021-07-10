import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import './Loading.css';

export default function Loading({ fixed }) {
  return (
    <div className={`loading-view${fixed ? ' fixed' : ''}`}>
      <CircularProgress color="secondary" />
    </div>
  );
}
