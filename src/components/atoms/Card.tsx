import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type CardProps = {
  className?: string;
};

const Card = ({
  className,
  children,
  ...props
}: PropsWithChildren<CardProps>) => (
  <div className={clsx('card', className)} {...props}>
    {children}
  </div>
);

export default Card;
