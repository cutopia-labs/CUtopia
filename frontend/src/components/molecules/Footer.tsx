import clsx from 'clsx';
import Link from 'next/link';
import { ReportCategory } from 'cutopia-types';
import { FC } from 'react';
import styles from '../../styles/components/molecules/Footer.module.scss';
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
    label: 'GitHub',
    to: 'https://github.com/cutopia-labs/CUtopia',
  },
  {
    label: 'Support ♡',
    to: 'https://ko-fi.com/cutopia',
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
    label: 'Follow Us',
    url: 'https://www.instagram.com/cutopia.app',
  },
  {
    label: 'Contact Us',
    url: 'mailto:cutopia.app@gmail.com',
  },
];

const renderItem = (item: MultiTypeLink) => {
  if (item.to) {
    return (
      <Link key={`${item.label}_${item.to}`} href={item.to}>
        <a className={clsx(styles.footerLink, 'hover')}>{item.label}</a>
      </Link>
    );
  }
  if (item.url) {
    return (
      <a
        key={item.url}
        className={clsx(styles.footerLink, 'hover')}
        href={item.url}
      >
        {item.label}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <span
        key={item.label}
        className={clsx(styles.footerLink, 'hover')}
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
  mb?: boolean;
  style?: string;
  visible?: boolean;
};

const Footer: FC<FooterProps> = ({ mt, mb, style, visible = true }) => {
  if (!visible) return null;
  return (
    <div className={clsx(styles.footer, mt && 'mt', mb && 'mb', style)}>
      {FOOTER_ITEMS.map(item => renderItem(item))}
    </div>
  );
};

export default Footer;
