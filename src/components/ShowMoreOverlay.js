import React from 'react';
import Button from '@material-ui/core/Button';
import {
  ExpandMore,
} from '@material-ui/icons';

import './ShowMoreOverlay.css';

export default function ShowMoreOverlay({ visible, onShowMore }) {
  if (visible) {
    return (
      <div
        className="show-more-overlay"
        onClick={onShowMore}
      >
        <div
          size="small"
          className="show-more-label center-row"
          variant="outlined"
        >
          Show More
          <ExpandMore />
        </div>
      </div>
    );
  }

  return null;
}
