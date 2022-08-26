import clsx from 'clsx';
import { FC } from 'react';
import colors from '../../constants/colors';
import { Grade } from '../../types';
import styles from '../../styles/components/molecules/SectionGroup.module.scss';
import { FCC } from '../../types/general';

type FormSectionProps = {
  title: string;
  className?: string;
};

export const FormSection: FCC<FormSectionProps> = ({
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

const SelectionGroup: FC<SelectionGroupProps> = ({
  selections,
  selectedIndex,
  onSelect,
}) => (
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
