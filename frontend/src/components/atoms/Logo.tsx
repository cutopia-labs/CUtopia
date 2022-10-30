import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/atoms/Logo.module.scss';

type LogoProps = {
  shine?: boolean;
  style?: string;
};

const Logo: FC<LogoProps> = ({ shine }) => (
  <div className={clsx(styles.logoContainer, shine && styles.shine)}>
    cutopia
  </div>
);

export default Logo;
