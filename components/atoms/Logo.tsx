import clsx from 'clsx';
import '../../styles/components/atoms/Logo.module.scss';

type LogoProps = {
  shine?: boolean;
};

const Logo = ({ shine }: LogoProps) => (
  <div className={clsx('logo-container', shine && 'shine')}>
    cutopia{!shine && <span className="logo-beta center-box">Beta</span>}
  </div>
);

export default Logo;
