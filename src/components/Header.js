import React, {
  useState, useContext, useRef, useEffect,
} from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../store';
import { SearchResult } from './forum/SearchPanel';

import './Header.css';
import Logo from './Logo';
import SearchInput from './SearchInput';

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

  const menuRef = useRef(null);
  const user = useContext(UserContext);

  const onSubmitSearch = e => {
    e.preventDefault();
  };

  return (
    <header className="header-container row">
      <Link className="header-logo" to="/">
        <Logo />
      </Link>
      <nav className="header-nav row">
        <SearchInput
          value={searchQuery}
          setValue={setSearchQuery}
          onSubmit={onSubmitSearch}
          setVisible={setVisible}
        />
        <div ref={menuRef} className="header-search-result card">
          {
            visible && Boolean(searchQuery)
            && (
              <SearchResult
                searchPayload={{
                  text: searchQuery,
                  mode: 'query',
                }}
                user={user}
                onClick={courseId => {
                  history.push(`/review/${courseId}`);
                }}
                limit={6}
                onMouseDown={courseId => {
                  history.push(`/review/${courseId}`);
                }}
              />
            )
          }
        </div>
        {
          SECTIONS.map(section => (
            <Link
              key={section.link}
              to={section.link}
              className={`nav-label-container${location.pathname.startsWith(section.link) && (section.link.length > 1 || section.link === location.pathname) ? '-active' : ''}`}
            >
              <span className="nav-label">{section.label}</span>
            </Link>
          ))
        }
      </nav>
    </header>
  );
};

export default Header;
