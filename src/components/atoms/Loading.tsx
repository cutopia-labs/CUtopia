import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import clsx from 'clsx';

import styles from '../../styles/components/atoms/Loading.module.scss';
import Logo from './Logo';

type LoadingProps = {
  fixed?: boolean;
  padding?: boolean;
  logo?: boolean;
  style?: string;
};

export default function Loading({
  fixed,
  padding = true,
  logo,
  style,
  ...props
}: LoadingProps & CircularProgressProps) {
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
}
