import { FCC } from '../../types/general';
import If, { IfProps } from './If';
import Loading, { LoadingProps } from './Loading';

type Props = {
  loading: boolean;
};

const LoadingView: FCC<Props & IfProps & LoadingProps> = ({
  loading,
  children,
  ...props
}) => (
  <If visible={!loading} elseNode={<Loading {...props} />}>
    {children || null}
  </If>
);

export default LoadingView;
