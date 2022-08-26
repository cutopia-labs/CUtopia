import clsx from 'clsx';
import styles from '../../styles/components/atoms/CardHeader.module.scss';
import { FCC } from '../../types/general';

type CardHeaderProps = {
  left?: JSX.Element;
  className?: string;
  title?: string;
};

const CardHeader: FCC<CardHeaderProps> = ({
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
