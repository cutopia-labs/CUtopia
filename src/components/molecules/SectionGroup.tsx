import clsx from 'clsx';
import { FC } from 'react';
import colors from '../../constants/colors';
import { Grade } from '../../types';
import styles from '../../styles/components/molecules/SectionGroup.module.scss';

type FormSectionProps = {
  title: string;
  className?: string;
};

export const FormSection: FC<FormSectionProps> = ({
  title,
  className,
  children,
}) => (
  <>
    <span className={clsx(className)}>{title}</span>
    {children}
  </>
);

type SelectionGroupProps = {
  selections: Grade[];
  selectedIndex: number;
  onSelect: (index: number) => any;
};

const SelectionGroup = ({
  selections,
  selectedIndex,
  onSelect,
}: SelectionGroupProps) => (
  <div className={clsx(styles.selectionGroup, 'center-row')}>
    {selections.map((selection, i) => (
      <span
        key={selection}
        className={clsx(
          styles.selectionItem,
          selectedIndex === i && 'selected'
        )}
        onClick={() => onSelect(i)}
        style={
          selectedIndex === i
            ? {
                backgroundColor: colors.gradeColors[selection],
              }
            : null
        }
      >
        {selection}
      </span>
    ))}
  </div>
);

export default SelectionGroup;
