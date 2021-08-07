import clsx from 'clsx';
import { FiExternalLink } from 'react-icons/fi';

import './Link.scss';

type LinkProps = {
  url: string;
  label: string;
  truncate?: number;
  icon?: boolean;
};

const Link = ({ url, label, truncate, icon = true }: LinkProps) => (
  <div className="link-container center-row">
    {icon && <FiExternalLink />}
    <a
      className={clsx(truncate && 'truncate')}
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
