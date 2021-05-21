import React, { useContext } from 'react';
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
    label: 'Forum',
    link: '/forum',
  },
  {
    label: 'Planer',
    link: '/planer',
  },
];

const Header = () => {
  const location = useLocation();
  const user = useContext(UserContext);
  return (
    <header className="header-container row">
      <Link className="header-logo" to="/">
        <Logo />
      </Link>
      <nav className="header-nav row">
        {
          SECTIONS.map(section => (
            <Link to={section.link} className={`nav-label-container${section.link === location.pathname ? '-active' : ''}`}>
              <span className="nav-label">{section.label}</span>
            </Link>
          ))
        }
      </nav>
    </header>
  );
};

export default observer(Header);
