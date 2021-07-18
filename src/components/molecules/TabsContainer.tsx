import clsx from 'clsx';
import { MenuItem } from '../../types';
import './TabsContainer.scss';

type TabsContainerProps = {
  items: MenuItem[];
  selected: string;
  onSelect: (label: string) => void;
  mb?: boolean;
};

const TabsContainer = ({
  items,
  selected,
  onSelect,
  mb,
}: TabsContainerProps) => (
  <div className={clsx('card', 'tabs-row', mb && 'mb')}>
    {items.map((item) => (
      <div
        key={item.label}
        className={clsx(
          'tab',
          'center-row',
          item.label === selected && 'active'
        )}
        onClick={() => onSelect(item.label)}
      >
        {item.icon}
        <span className="caption">{item.label}</span>
      </div>
    ))}
  </div>
);

export default TabsContainer;
