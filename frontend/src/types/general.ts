import { FC, ReactNode } from 'react';

/** FC with children */
export type FCC<T = any> = FC<
  {
    children: ReactNode;
  } & T
>;
