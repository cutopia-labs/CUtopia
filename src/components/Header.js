import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Header.css';
import Logo from './Logo';

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

export default Header;
