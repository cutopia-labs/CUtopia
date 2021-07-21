import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { BoxProps } from '@material-ui/core';

type CardProps = {
  className?: string;
};

const Card = ({
  className,
  children,
  ...props
}: PropsWithChildren<BoxProps & CardProps>) => (
  <div className={clsx('card', className)} {...props}>
    {children}
  </div>
);

export default Card;
