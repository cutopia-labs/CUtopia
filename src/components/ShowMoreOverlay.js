import React from 'react';
import Button from '@material-ui/core/Button';

import './ShowMoreOverlay.css';

export default function ShowMoreOverlay({ visible, onShowMore }) {
  if (visible) {
    return (
      <div className="show-more-overlay">
        <Button size="small" className="show-more-btn" variant="outlined" onClick={onShowMore}>Show More</Button>
      </div>
    );
  }

  return null;
}
