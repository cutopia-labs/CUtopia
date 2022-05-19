import clsx from 'clsx';
import { MenuItem } from '../../types';
import styles from '../../styles/components/molecules/TabsContainer.module.scss';

type TabsContainerProps = {
  items: MenuItem[];
  selected: string;
  onSelect: (label: any) => void;
  mb?: boolean;
};

const TabsContainer = ({
  items,
  selected,
  onSelect,
  mb,
}: TabsContainerProps) => (
  <div className={clsx('card', 'tabs-row', mb && 'mb')}>
    {items.map(item => (
      <div
        key={item.label}
        className={clsx(
          styles.tab,
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
