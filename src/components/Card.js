import React from 'react';
import { Box } from '@material-ui/core';

const Card = ({
  color = '#dedede80',
  radius = '8px',
  bgColor = 'rgba(255,255,255,1)',
  children,
  ...props
}) => (
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
