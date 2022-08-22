import If, { IfProps } from './If';
import Loading from './Loading';

type Props = {
  loading: boolean;
};

/* @ts-ignore */
const LoadingView: FC<Props & IfProps> = ({ loading, children, ...props }) => (
  <If visible={!loading} elseNode={<Loading />} {...props}>
    {children}
  </If>
);

export default LoadingView;
