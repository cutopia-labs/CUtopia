import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import './SearchInput.scss';
import clsx from 'clsx';

export default function SearchInput({
  value,
  setValue,
  onSubmit,
  visible,
  setVisible,
  isMobile,
  inputRef,
}) {
  return (
    <form
      className={clsx(
        'search-input-container',
        isMobile && 'mobile',
        visible && 'active'
      )}
      onSubmit={onSubmit}
    >
      <IconButton
        size="small"
        type="submit"
        className="search-input-icon"
        aria-label="search"
        onClick={async (e) => {
          if (isMobile && inputRef.current) {
            setVisible(true);
            await new Promise((resolve) => setTimeout(resolve, 100));
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setVisible(true)}
      />
    </form>
  );
}
