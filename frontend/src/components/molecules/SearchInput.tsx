import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import clsx from 'clsx';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { FC } from 'react';

import styles from '../../styles/components/molecules/SearchInput.module.scss';

enum SearchInputMode {
  SHOW_DROPDOWN,
  HIDE_DROPDOWN,
  SEARCH_PANEL,
  SEARCH_RESULT,
}

const SearchInput: FC<any> = ({
  searchPayload,
  setSearchPayload,
  onSubmit,
  visible,
  setVisible,
  isMobile,
  inputRef,
}) => {
  const router = useRouter();
  const plannerCourseMatch =
    router.pathname.includes('planner') && router.query.courseId;
  const getButtonActionMode = () => {
    if (plannerCourseMatch && isMobile && visible) {
      return SearchInputMode.SEARCH_RESULT;
    }
    if (!visible && isMobile) {
      return SearchInputMode.SHOW_DROPDOWN;
    }
    if (!searchPayload && isMobile) {
      return SearchInputMode.HIDE_DROPDOWN;
    }
    if (
      searchPayload &&
      (searchPayload.mode !== 'query' || searchPayload.text)
    ) {
      return SearchInputMode.SEARCH_PANEL;
    }
    return SearchInputMode.SHOW_DROPDOWN;
  };
  const currMode = getButtonActionMode();

  const onIconButtonPress = async e => {
    e.stopPropagation();
    switch (currMode) {
      case SearchInputMode.SHOW_DROPDOWN:
        if (isMobile && inputRef.current) {
          setVisible(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          inputRef.current.focus();
        }
        break;
      case SearchInputMode.SEARCH_RESULT:
        router.push('/planner');
        break;
      /* @ts-ignore */
      case SearchInputMode.HIDE_DROPDOWN:
        setVisible(false);
      /* fall through */
      case SearchInputMode.SEARCH_PANEL:
        setSearchPayload(null);
        break;
    }
  };

  return (
    <form
      className={clsx(
        styles.searchInputContainer,
        isMobile && 'mobile',
        visible && styles.active
      )}
      onSubmit={onSubmit}
    >
      <IconButton
        size="small"
        type="submit"
        aria-label="search"
        onClick={e => onIconButtonPress(e)}
      >
        {currMode === SearchInputMode.SHOW_DROPDOWN ? (
          <SearchIcon />
        ) : (
          <ArrowBack />
        )}
      </IconButton>
      <InputBase
        inputRef={inputRef}
        className="search-input"
        placeholder="Search for courses"
        value={searchPayload?.text || ''}
        onChange={e =>
          setSearchPayload(
            e.target.value
              ? {
                  mode: 'query',
                  text: e.target.value,
                }
              : null
          )
        }
        onFocus={() => setVisible(true)}
      />
    </form>
  );
};

export default SearchInput;
