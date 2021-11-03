import clsx from 'clsx';
import './Logo.scss';

type LogoProps = {
  shine?: Boolean;
};

const Logo = ({ shine }: LogoProps) => (
  <div className={clsx('logo-container', shine && 'shine')}>
    cutopia{!shine && <span className="logo-beta center-box">Beta</span>}
  </div>
);

export default Logo;
