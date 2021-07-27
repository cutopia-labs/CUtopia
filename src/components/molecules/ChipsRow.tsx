import { Chip } from '@material-ui/core';

import './ChipsRow.scss';

type ChipsRowProps = {
  items: string[];
  select: string;
  setSelect: (item: string) => any;
  variant?: string;
  selectedColor?: string;
};

const ChipsRow = ({
  items,
  select,
  setSelect,
  variant,
  selectedColor,
}: ChipsRowProps) => (
  <div className="chips-row">
    {items.map((item) => (
      <Chip
        key={item}
        className={`chip-item center-row${item === select ? ' active' : ''}`}
        onClick={() => setSelect(item)}
        label={item}
        variant={(variant as any) || 'outlined'}
        color={
          select === item ? (selectedColor as any) || 'secondary' : 'default'
        }
      />
    ))}
  </div>
);

export default ChipsRow;
