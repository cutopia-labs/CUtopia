import { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import {
  ChatBubble,
  ChatBubbleOutlineOutlined,
  Home,
  HomeOutlined,
  Menu as MenuIcon,
  Note,
  NoteOutlined,
} from '@material-ui/icons';
import clsx from 'clsx';

import { BsChatDots, BsFillChatDotsFill } from 'react-icons/bs';
import './Header.scss';
import Logo from '../atoms/Logo';
import useMobileQuery from '../../hooks/useMobileQuery';
import SearchDropdown from './SearchDropdown';

const SECTIONS = [
  {
    icon: <HomeOutlined />,
    filledIcon: <Home />,
    label: 'Home',
    link: '/',
  },
  {
    icon: <ChatBubbleOutlineOutlined />,
    filledIcon: <ChatBubble />,
    label: 'Review',
    link: '/review',
  },
  {
    icon: <BsChatDots />,
    filledIcon: <BsFillChatDotsFill />,
    label: 'Discussion',
    link: '/discussion',
  },
  {
    icon: <NoteOutlined />,
    filledIcon: <Note />,
    label: 'Planner',
    link: '/planner',
  },
];

const Header = () => {
  const location = useLocation();
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const isMobile = useMobileQuery();
  const [anchorEl, setAnchorEl] = useState(null);
  const navSections = SECTIONS.map(section => {
    const active =
      location.pathname.startsWith(section.link) &&
      (section.link.length > 1 || section.link === location.pathname);
    return (
      <Link
        key={section.link}
        to={section.link}
        className={clsx(
          'nav-label-container column center',
          active && 'active'
        )}
      >
        {active ? section.filledIcon : section.icon}
        {section.label}
      </Link>
    );
  });

  return (
    <header className="header-background-container">
      <div className="header-container row">
        {isMobile && (
          <>
            {!visible && (
              <IconButton
                aria-label="sort"
                size="small"
                onClick={e => setAnchorEl(e.currentTarget)}
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
              {SECTIONS.map(section => (
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
          <SearchDropdown />
          {!isMobile && navSections}
        </nav>
      </div>
    </header>
  );
};

export default Header;
