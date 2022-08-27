import { ReactNode } from 'react';
import { FCC } from '../../types/general';
import If from './If';
import Loading, { LoadingProps } from './Loading';

type Props = {
  loading: boolean;
  elseNode?: ReactNode;
};

const LoadingView: FCC<Props & LoadingProps> = ({
  loading,
  children,
  ...props
}) => (
  <If visible={!loading} elseNode={<Loading {...props} />}>
    {children || null}
  </If>
);

export default LoadingView;
