import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import colors from '../../constants/colors';
import { Grade } from '../../types';

type FormSectionProps = {
  title: string;
  className?: string;
};

export const FormSection = ({
  title,
  className,
  children,
}: PropsWithChildren<FormSectionProps>) => (
  <>
    <span className={clsx('form-section-title', className)}>{title}</span>
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
  <div className="selection-group center-row">
    {selections.map((selection, i) => (
      <span
        key={selection}
        className={`selecion-item${selectedIndex === i ? ' selected' : ''}`}
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
