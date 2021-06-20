import React from 'react';
import { Chip } from '@material-ui/core';

import './ChipsRow.css';

const ChipsRow = ({
  items, select, setSelect,
}) => (
  <div className="chips-row">
    {
      items.map(item => (
        <Chip
          key={item}
          className={`chip-item center-row${item === select ? ' active' : ''}`}
          onClick={() => setSelect(item)}
          label={item}
          variant="outlined"
          color={select === item ? 'secondary' : 'default'}
        />
      ))
    }
  </div>
);

export default ChipsRow;
