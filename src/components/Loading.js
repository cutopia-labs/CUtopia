import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import './Loading.css';

export default function Loading({ absolute }) {
  return (
    <div className={`loading-view${absolute ? ' absolute' : ''}`}>
      <CircularProgress />
    </div>
  );
}
