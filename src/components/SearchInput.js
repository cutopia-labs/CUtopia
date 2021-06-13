import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import './SearchInput.css';

export default function SearchInput({
  value, setValue, onSubmit, setVisible,
}) {
  return (
    <form className="search-input-container" onSubmit={onSubmit}>
      <IconButton size="small" type="submit" className="search-input-icon" aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        className="search-input"
        placeholder="Search for courses"
        inputProps={{ 'aria-label': 'search google maps' }}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      />
    </form>
  );
}
