import clsx from 'clsx';
import { FC } from 'react';
import { FiExternalLink } from 'react-icons/fi';

import styles from '../../styles/components/molecules/Link.module.scss';

type LinkProps = {
  url: string;
  label: string;
  truncate?: number;
  icon?: boolean;
  style?: string;
};

const Link: FC<LinkProps> = ({ url, label, truncate, icon = true, style }) => (
  <div className={clsx(styles.linkContainer, 'center-row', style)}>
    {icon && <FiExternalLink />}
    <a
      className={clsx(truncate && styles.truncate)}
      style={{ maxWidth: `${truncate}px` }}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  </div>
);

export default Link;
