import { ReactNode } from 'react';
import { FCC } from '../../types/general';

export type IfProps = {
  visible: boolean | any;
  elseNode?: ReactNode;
};

// @ts-ignore
const If: FCC<IfProps> = ({ visible, children, elseNode = null }) => {
  return visible ? children : elseNode;
};

export default If;
