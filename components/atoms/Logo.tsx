import clsx from 'clsx';
import { FC } from 'react';
import '../../styles/components/atoms/Logo.module.scss';

type LogoProps = {
  shine?: boolean;
  style?: string;
};

const Logo: FC<LogoProps> = ({ shine }) => (
  <div className={clsx('logoContainer', shine && 'shine')}>
    cutopia{!shine && <span className="logo-beta center-box">Beta</span>}
  </div>
);

export default Logo;
