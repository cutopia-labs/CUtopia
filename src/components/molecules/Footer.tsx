import clsx from 'clsx';
import { Link } from 'react-router-dom';
import './Footer.scss';
import { ReportCategory } from 'cutopia-types/lib/codes';
import { viewStore } from '../../store';

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
    label: 'Privacy',
    to: '/privacy',
  },
  {
    label: 'Terms',
    to: '/terms',
  },
  {
    label: 'Report Issues',
    onClick: () => {
      viewStore.setDialog({
        key: 'reportIssues',
        contentProps: {
          reportCategory: ReportCategory.ISSUE,
        },
      });
    },
  },
  {
    label: 'Contact Us',
    url: 'mailto::cutopia.app@gmail.com',
  },
];

const renderItem = (item: MultiTypeLink) => {
  if (item.to) {
    return (
      <Link key={item.to} className="footer-link hover" to={item.to}>
        {item.label}
      </Link>
    );
  }
  if (item.url) {
    return (
      <a key={item.url} className="footer-link hover" href={item.url}>
        {item.label}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <span
        key={item.label}
        className="footer-link hover"
        onClick={item.onClick}
      >
        {item.label}
      </span>
    );
  }
  return null;
};

type FooterProps = {
  mt?: boolean;
};

const Footer = ({ mt }: FooterProps) => (
  <div className={clsx('footer', mt && 'mt')}>
    {FOOTER_ITEMS.map(item => renderItem(item))}
  </div>
);

export default Footer;
