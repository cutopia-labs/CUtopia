import { Chip } from '@material-ui/core';
import clsx from 'clsx';
import { ErrorCardMode } from '../../types';

import './ChipsRow.scss';
import ErrorCard from './ErrorCard';

type ChipsRowProps = {
  items: string[];
  select?: string;
  setSelect?: (item: string) => any;
  onItemClick?: (item: string) => any;
  chipClassName?: string;
};

const ChipsRow = ({
  items,
  select,
  setSelect,
  className,
  chipClassName,
  onItemClick,
  ...props
}: ChipsRowProps & React.HTMLProps<HTMLDivElement>) => {
  if (!items.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} />;
  }
  return (
    <div className={clsx('chips-row', className)} {...props}>
      {items.map((item) => (
        <Chip
          key={item}
          className={clsx(
            'chip-item',
            item === select && 'active',
            chipClassName
          )}
          onClick={() => {
            if (onItemClick) {
              onItemClick(item);
            } else {
              setSelect(item);
            }
          }}
          label={item}
          variant={select === item ? 'default' : 'outlined'}
        />
      ))}
    </div>
  );
};

export default ChipsRow;
