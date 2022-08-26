import clsx from 'clsx';
import { FCC } from '../../types/general';

type PageProps = {
  className?: string;
  center?: boolean;
  padding?: boolean;
  column?: boolean;
};

const Page: FCC<PageProps> = ({
  children,
  className,
  center,
  padding,
  column,
}) => {
  return (
    <div
      className={clsx(
        'page',
        center && 'center-page',
        padding && 'padding',
        column && 'column',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Page;
