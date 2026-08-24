import clsx from 'clsx';
import { FC } from 'react';
import { MenuItem } from '../../types';

type TabsContainerProps = {
  items: MenuItem[];
  selected: string;
  onSelect: (label: any) => void;
  mb?: boolean;
  className?: string;
};

const TabsContainer: FC<TabsContainerProps> = ({
  items,
  selected,
  onSelect,
  mb,
  className,
}) => (
  <div className={clsx('card', 'tabs-row', mb && 'mb', className)}>
    {items.map(item => (
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
