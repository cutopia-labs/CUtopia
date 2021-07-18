import { Chip } from '@material-ui/core';

import './ChipsRow.scss';

type ChipsRowProps = {
  items: string[];
  select: string;
  setSelect: (item: string) => any;
};

const ChipsRow = ({ items, select, setSelect }: ChipsRowProps) => (
  <div className="chips-row">
    {items.map((item) => (
      <Chip
        key={item}
        className={`chip-item center-row${item === select ? ' active' : ''}`}
        onClick={() => setSelect(item)}
        label={item}
        variant="outlined"
        color={select === item ? 'secondary' : 'default'}
      />
    ))}
  </div>
);

export default ChipsRow;
