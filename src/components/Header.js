import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';

import './Header.css';

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

export default function Header() {
  const location = useLocation();
  return (
    <header className="header-container row">
      <Link className="header-logo" to="/" />
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
}
