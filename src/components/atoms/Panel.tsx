import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type PageProps = {
  className?: string;
  center?: boolean;
  padding?: boolean;
  column?: boolean;
};

const Page = ({
  children,
  className,
  center,
  padding,
  column,
}: PropsWithChildren<PageProps>) => {
  return (
    <div
      className={clsx(
        'panel',
        center && 'center-panel',
        padding && 'padding',
        column ? 'column' : 'row',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Page;
