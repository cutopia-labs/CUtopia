import { FC } from 'react';
import clsx from 'clsx';

type PageProps = {
  className?: string;
  center?: boolean;
  padding?: boolean;
  column?: boolean;
};

const Page: FC<PageProps> = ({ children, className, center, padding }) => {
  return (
    <div
      className={clsx(
        'page',
        center && 'center-page',
        padding && 'padding',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Page;
