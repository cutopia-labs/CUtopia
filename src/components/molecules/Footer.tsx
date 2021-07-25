import { Link } from 'react-router-dom';
import './Footer.scss';

type MultiTypeLink = {
  label: string;
  to?: string;
  onClick?: (...args: any[]) => any;
  url?: string;
};

const FOOTER_ITEMS = [
  {
    label: 'About',
    to: '/about',
  },
  {
    label: 'Changelog',
    to: '/changelog',
  },
  {
    label: 'Privacy',
    to: '/privacy',
  },
  {
    label: 'Terms',
    to: '/terms',
  },
  {
    label: 'Report Issues',
    onClick: () => {},
  },
  {
    label: 'Contact Us',
    url: 'mailto::cutopia.team@gmail.com',
  },
];

const renderItem = (item: MultiTypeLink) => {
  if (item.to) {
    return (
      <Link key={item.to} className="footer-link" to={item.to}>
        {item.label}
      </Link>
    );
  }
  if (item.url) {
    return (
      <a className="footer-link" href={item.url}>
        {item.label}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <span className="footer-link" onClick={item.onClick}>
        {item.label}
      </span>
    );
  }
  return null;
};

const Footer = () => (
  <div className="footer">{FOOTER_ITEMS.map((item) => renderItem(item))}</div>
);

export default Footer;
