import { Chip } from '@material-ui/core';
import clsx from 'clsx';
import { ErrorCardMode } from '../../types';

import './ChipsRow.scss';
import ErrorCard from './ErrorCard';

type ChipsRowProps = {
  items: string[];
  select?: string | string[];
  setSelect?: (item: string, selected: boolean) => any;
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
  const multipleSelection = typeof select !== 'string';
  return (
    <div className={clsx('chips-row', className)} {...props}>
      {items.map(item => {
        const selected = multipleSelection
          ? select?.includes(item)
          : select === item;
        return (
          <Chip
            key={item}
            className={clsx('chip-item', selected && 'active', chipClassName)}
            onClick={() => {
              if (onItemClick) {
                onItemClick(item);
              } else {
                setSelect(item, selected);
              }
            }}
            label={item}
            variant={selected ? 'default' : 'outlined'}
          />
        );
      })}
    </div>
  );
};

export default ChipsRow;
