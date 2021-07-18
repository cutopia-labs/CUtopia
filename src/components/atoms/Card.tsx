import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { BoxProps, Box } from '@material-ui/core';

type CardProps = {
  className?: string;
};

const Card = ({
  className,
  children,
  ...props
}: PropsWithChildren<BoxProps & CardProps>) => (
  <Box className={clsx('card', className)} {...props}>
    {children}
  </Box>
);

export default Card;
