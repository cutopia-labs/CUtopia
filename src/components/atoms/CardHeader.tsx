import './CardHeader.scss';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type CardHeaderProps = {
  left?: JSX.Element;
  className?: string;
  title?: string;
};

const CardHeader = ({
  className,
  children,
  left,
  title,
  ...props
}: PropsWithChildren<CardHeaderProps>) => (
  <header className={clsx('card-header center-row', className)} {...props}>
    {left}
    <h4>{title}</h4>
    {children}
  </header>
);

export default CardHeader;
