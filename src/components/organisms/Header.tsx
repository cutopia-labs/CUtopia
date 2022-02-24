import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
    icon: <NoteOutlined />,
    filledIcon: <Note />,
    label: 'Planner',
    link: '/planner',
  },
];

const Header = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const isMobile = useMobileQuery();
  const [anchorEl, setAnchorEl] = useState(null);
  const navSections = SECTIONS.map(section => {
    const active =
      router.pathname.startsWith(section.link) &&
      (section.link.length > 1 || section.link === router.pathname);
    return (
      <Link key={section.link} href={section.link}>
        <a
          className={clsx(
            'nav-label-container column center',
            active && 'active'
          )}
        >
          {active ? section.filledIcon : section.icon}
          {section.label}
        </a>
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
                  onClick={() => [router.push(section.link), setAnchorEl(null)]}
                >
                  {section.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
        {(!visible || !isMobile) && (
          <Link href="/">
            <a className="header-logo">
              <Logo />
            </a>
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
