import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

import './SearchInput.css';

export default function SearchInput() {
  return (
    <div className="search-input-container">
      <IconButton size="small" type="submit" className="search-input-icon" aria-label="search">
        <SearchIcon />
      </IconButton>
      <Divider className="search-input-divider" orientation="vertical" />
      <InputBase
        className="search-input"
        placeholder="Search for courses"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
    </div>
  );
}
