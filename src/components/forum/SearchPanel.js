import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';

import './SearchPanel.css';

export default function SearchPanel() {
  const location = useLocation();
  return (
    <div className="search-panel card">
      <div>Hiii</div>
    </div>
  );
}
