import CircularProgress from '@material-ui/core/CircularProgress';

import './Loading.css';

type LoadingProps = {
  fixed?: boolean;
};

export default function Loading({ fixed }: LoadingProps) {
  return (
    <div className={`loading-view${fixed ? ' fixed' : ''}`}>
      <CircularProgress color="secondary" />
    </div>
  );
}
