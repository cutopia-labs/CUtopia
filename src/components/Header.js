import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import './Header.css';
import Logo from './Logo';
import { UserContext } from '../store';
import { MODES, LOGIN_STATES } from '../constants/states';

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
  const user = useContext(UserContext);
  useEffect(() => {
    console.log(location);
  }, [location])
  return (
    <header className="header-container row">
      <Link className="header-logo" to="/">
        <Logo />
      </Link>
      <nav className="header-nav row">
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

export default observer(Header);
