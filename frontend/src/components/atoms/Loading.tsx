import { CircularProgress, CircularProgressProps } from '@mui/material';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/atoms/Loading.module.scss';
import Logo from './Logo';

export type LoadingProps = {
  fixed?: boolean;
  padding?: boolean;
  logo?: boolean;
  style?: string;
};

const Loading: FC<LoadingProps & CircularProgressProps> = ({
  fixed,
  padding = true,
  logo,
  style,
  ...props
}) => {
  return (
    <div
      className={clsx(
        styles.loadingView,
        fixed && 'fixed',
        padding && 'padding',
        logo && 'logo',
        style
      )}
    >
      {logo ? (
        <Logo shine />
      ) : (
        <CircularProgress color="secondary" {...props} />
      )}
    </div>
  );
};

export default Loading;
