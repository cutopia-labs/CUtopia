import { useState, useContext, useRef } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useMediaQuery, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import clsx from 'clsx';

import { UserContext } from '../../store';
import { SearchResult } from '../forum/SearchPanel';
import './Header.scss';
import Logo from '../atoms/Logo';
import SearchInput from '../molecules/SearchInput';

const SECTIONS = [
  {
    label: 'Home',
    link: '/',
  },
  {
    label: 'Review',
    link: '/review',
  },
  {
    label: 'Planner',
    link: '/planner',
  },
];

const Header = () => {
  const location = useLocation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width:1260px)');
  const [anchorEl, setAnchorEl] = useState(null);

  const inputRef = useRef(null);
  const user = useContext(UserContext);

  const onSubmitSearch = (e) => {
    e.preventDefault();
  };

  const navSections = SECTIONS.map((section) => (
    <Link
      key={section.link}
      to={section.link}
      className={clsx(
        'nav-label-container',
        location.pathname.startsWith(section.link) &&
          (section.link.length > 1 || section.link === location.pathname) &&
          'active'
      )}
    >
      {section.label}
    </Link>
  ));

  return (
    <header className="header-background-container">
      <div className="header-container row">
        {isMobile && (
          <>
            {(!visible || !isMobile) && (
              <IconButton
                aria-label="sort"
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Menu
              id="simple-menu"
              className="sort-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {SECTIONS.map((section) => (
                <MenuItem
                  key={section.link}
                  onClick={() => [
                    history.push(section.link),
                    setAnchorEl(null),
                  ]}
                >
                  {section.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
        {(!visible || !isMobile) && (
          <Link className="header-logo" to="/">
            <Logo />
          </Link>
        )}
        <nav className="header-nav row">
          <SearchInput
            isMobile={isMobile}
            value={searchQuery}
            setValue={setSearchQuery}
            onSubmit={onSubmitSearch}
            inputRef={inputRef}
            setVisible={setVisible}
          />
          <div className="header-search-result card">
            {visible && Boolean(searchQuery) && (
              <SearchResult
                searchPayload={{
                  text: searchQuery,
                  mode: 'query',
                }}
                user={user}
                limit={isMobile ? 4 : 6}
                onMouseDown={(courseId) => {
                  history.push(`/review/${courseId}`);
                }}
              />
            )}
          </div>
          {!isMobile && navSections}
        </nav>
      </div>
    </header>
  );
};

export default Header;
