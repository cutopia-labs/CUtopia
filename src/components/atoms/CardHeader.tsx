import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/atoms/CardHeader.module.scss';

type CardHeaderProps = {
  left?: JSX.Element;
  className?: string;
  title?: string;
};

const CardHeader: FC<CardHeaderProps> = ({
  className,
  children,
  left,
  title,
  ...props
}) => (
  <header
    className={clsx(styles.cardHeader, 'center-row', className)}
    {...props}
  >
    {left}
    <h4>{title}</h4>
    {children}
  </header>
);

export default CardHeader;
