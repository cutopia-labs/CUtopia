import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import '../../styles/components/molecules/SearchInput.module.scss';
import clsx from 'clsx';
import { ArrowBack } from '@material-ui/icons';
import { useRouter } from 'next/router';

enum SearchInputMode {
  SHOW_DROPDOWN,
  HIDE_DROPDOWN,
  SEARCH_PANEL,
  SEARCH_RESULT,
}

export default function SearchInput({
  searchPayload,
  setSearchPayload,
  onSubmit,
  visible,
  setVisible,
  isMobile,
  inputRef,
}) {
  const router = useRouter();
  const plannerCourseMatch =
    router.pathname.includes('planner') && router.query.courseId;
  const getButtonActionMode = () => {
    console.log(searchPayload);
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

  const onIconButtonPress = async e => {
    e.stopPropagation();
    switch (getButtonActionMode()) {
      case SearchInputMode.SHOW_DROPDOWN:
        if (isMobile && inputRef.current) {
          console.log('Hi');
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
        'search-inputContainer',
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
        onClick={e => onIconButtonPress(e)}
      >
        {getButtonActionMode() === SearchInputMode.SHOW_DROPDOWN ? (
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
}
