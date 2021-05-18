import React from 'react';

import './ListItem.css';
import colors from '../constants/colors';

const MyListItem = ({
  label, onPress, chevron, children, noBorder, ribbonIndex,
}) => (
  <div
    className={`list-item-container${!noBorder ? ' border' : ''} row`}
    onPress={onPress}
  >
    {
      ribbonIndex !== undefined
        && <span className="list-item-color-bar" style={{ backgroundColor: colors.randomColors[ribbonIndex >= colors.randomColors.length ? (ribbonIndex % colors.randomColors.length) : ribbonIndex] }} />
    }
    {
      label
        && <span className="list-item-label">{label}</span>
    }
    {children}
    {
      chevron
        && <span className="list-item-label chevron">{'\u203A'}</span>
    }
  </div>
);

export default MyListItem;
