import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type CardProps = {
  inPlace?: boolean;
};

const Card = ({
  className,
  children,
  inPlace,
  ...props
}: PropsWithChildren<CardProps & React.HTMLProps<HTMLDivElement>>) => (
  <div className={clsx(inPlace ? 'column' : 'card', className)} {...props}>
    {children}
  </div>
);

export default Card;
