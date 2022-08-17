import { FC, ReactNode } from 'react';

export type IfProps = {
  visible: boolean;
  elseNode?: ReactNode;
};

const If: FC<IfProps> = ({ visible, children, elseNode = null }) => {
  return visible ? children : elseNode;
};

/*
export default memo(
  If,
  (props, oldProps) => props.visible === oldProps.visible
);
*/

export default If;
