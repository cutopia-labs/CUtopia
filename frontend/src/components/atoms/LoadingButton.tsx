import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';

import Loading from './Loading';

type LoadingbuttonProps = {
  loading: boolean;
};

const LoadingButton: FC<LoadingbuttonProps & ButtonProps> = ({
  loading,
  children,
  ...props
}) => (
  <Button {...props}>
    {loading ? <Loading padding={false} size={24} /> : children}
  </Button>
);

export default LoadingButton;
