import './CardHeader.scss';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type CardHeaderProps = {
  className?: string;
  title?: string;
};

const CardHeader = ({
  className,
  children,
  title,
  ...props
}: PropsWithChildren<CardHeaderProps>) => (
  <header className={clsx('card-header', className)} {...props}>
    <h4>{title}</h4>
    {children}
  </header>
);

export default CardHeader;
