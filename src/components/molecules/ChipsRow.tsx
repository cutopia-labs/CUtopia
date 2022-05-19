import { Chip } from '@material-ui/core';
import clsx from 'clsx';
import { FC, MouseEvent } from 'react';
import { ErrorCardMode } from '../../types';

import styles from '../../styles/components/molecules/ChipsRow.module.scss';
import ErrorCard from './ErrorCard';

type ChipsRowProps = {
  items: string[];
  select?: string | string[];
  setSelect?: (item: string, selected: boolean) => any;
  onItemClick?: (item: string, e: MouseEvent<HTMLDivElement>) => any;
  chipClassName?: string;
};

const ChipsRow: FC<ChipsRowProps & React.HTMLProps<HTMLDivElement>> = ({
  items,
  select,
  setSelect,
  className,
  chipClassName,
  onItemClick,
  ...props
}) => {
  if (!items.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} />;
  }
  const multipleSelection = typeof select !== 'string';
  return (
    <div className={clsx(styles.chipsRow, className)} {...props}>
      {items.map(item => {
        const selected = multipleSelection
          ? select?.includes(item)
          : select === item;
        return (
          <Chip
            key={item}
            className={clsx(selected && 'active', chipClassName)}
            onClick={e => {
              if (onItemClick) {
                onItemClick(item, e);
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
