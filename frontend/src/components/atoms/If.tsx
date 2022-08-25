import { FC, ReactNode } from 'react';

export type IfProps = {
  visible: boolean | any;
  elseNode?: ReactNode;
};

/* @ts-ignore */
const If: FC<IfProps> = ({ visible, children, elseNode = null }) => {
  return visible ? children : elseNode;
};

export default If;
