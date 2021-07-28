import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import clsx from 'clsx';

import './Loading.scss';

type LoadingProps = {
  fixed?: boolean;
  padding?: boolean;
};

export default function Loading({
  fixed,
  padding = true,
  ...props
}: LoadingProps & CircularProgressProps) {
  return (
    <div
      className={clsx('loading-view', fixed && 'fixed', padding && 'padding')}
    >
      <CircularProgress color="secondary" {...props} />
    </div>
  );
}
