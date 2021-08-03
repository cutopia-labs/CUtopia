import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type CardProps = {
  className?: string;
  inPlace?: boolean;
};

const Card = ({
  className,
  children,
  inPlace,
  ...props
}: PropsWithChildren<CardProps>) => (
  <div className={clsx(inPlace ? 'column' : 'card', className)} {...props}>
    {children}
  </div>
);

export default Card;
