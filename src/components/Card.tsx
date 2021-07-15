import { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@material-ui/core';

type CardProps = {
  color?: string;
  radius?: string;
  bgColor?: string;
};

const Card = ({
  color = '#dedede80',
  radius = '8px',
  bgColor = 'rgba(255,255,255,1)',
  children,
  ...props
}: PropsWithChildren<CardProps & BoxProps>) => (
  <Box
    border={`1px solid ${color}`}
    borderRadius={radius}
    bgcolor={bgColor}
    {...props}
  >
    {children}
  </Box>
);

export default Card;
