import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import './SearchInput.css';

export default function SearchInput({
  value,
  setValue,
  onSubmit,
  setVisible,
  isMobile,
  inputRef,
}) {
  return (
    <form
      className={`search-input-container${isMobile ? ' mobile' : ''}`}
      onSubmit={onSubmit}
    >
      <IconButton
        size="small"
        type="submit"
        className="search-input-icon"
        aria-label="search"
        onClick={(e) => {
          if (isMobile && inputRef.current) {
            e.preventDefault();
            console.log('Focused');
            inputRef.current.focus();
          }
        }}
      >
        <SearchIcon />
      </IconButton>
      <InputBase
        inputRef={inputRef}
        className="search-input"
        placeholder="Search for courses"
        inputProps={{ 'aria-label': 'search google maps' }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      />
    </form>
  );
}
