import { Button, ButtonProps } from '@material-ui/core';

import Loading from './Loading';

type LoadingbuttonProps = {
  loading: boolean;
};

const LoadingButton = ({
  loading,
  children,
  ...props
}: LoadingbuttonProps & ButtonProps) => (
  <Button {...props}>
    {loading ? <Loading padding={false} size={24} /> : children}
  </Button>
);

export default LoadingButton;
