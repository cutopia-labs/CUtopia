import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import clsx from 'clsx';

import './Loading.scss';
import Logo from './Logo';

type LoadingProps = {
  fixed?: boolean;
  padding?: boolean;
  logo?: boolean;
};

export default function Loading({
  fixed,
  padding = true,
  logo,
  ...props
}: LoadingProps & CircularProgressProps) {
  return (
    <div
      className={clsx(
        'loading-view',
        fixed && 'fixed',
        padding && 'padding',
        logo && 'logo'
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
