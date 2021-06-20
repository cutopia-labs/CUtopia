import React from 'react';
import './BottomBorderRow.css';

const BottomBorderRow = ({
  items, select, setSelect, onSelectItems,
}) => (
  <div className="card bottom-border-row">
    {
      items.map(item => (
        <div
          key={item.label}
          className={`bottom-border-item center-row${item.label === select ? ' active' : ''}`}
          onClick={() => setSelect(item.label)}
        >
          {item.icon}
          <span className="caption">{item.label}</span>
          {
            item.label === select && (onSelectItems || {})[item.label]
          }
        </div>
      ))
    }
  </div>
);

export default BottomBorderRow;
