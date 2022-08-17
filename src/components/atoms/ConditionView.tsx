import { FC } from 'react';

type Props = {
  visible: boolean;
};

const ConditionView: FC<Props> = ({ visible, children }) => {
  if (!visible) return null;
  return children;
};

export default ConditionView;
