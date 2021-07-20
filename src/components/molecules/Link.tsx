import { FiExternalLink } from 'react-icons/fi';

import './Link.scss';

type LinkProps = {
  url: string;
  label: string;
};

const Link = ({ url, label }: LinkProps) => (
  <div className="link-container center-row">
    <FiExternalLink />
    <a href={url} target="_blank" rel="noreferrer">
      {label}
    </a>
  </div>
);

export default Link;
