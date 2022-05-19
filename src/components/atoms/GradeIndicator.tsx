import clsx from 'clsx';
import { FC } from 'react';
import colors from '../../constants/colors';
import updateOpacity from '../../helpers/updateOpacity';
import { getLabel } from '../../helpers';

type GradeIndicatorProps = {
  grade: string | number;
  additionalClassName?: string;
};

const GradeIndicator: FC<GradeIndicatorProps> = ({
  grade,
  additionalClassName,
}) => {
  const label = getLabel(grade);
  const color = colors.gradeColors[label.charAt(0)];
  return (
    <div
      className={clsx('grade-indicator', additionalClassName)}
      style={{
        background: updateOpacity(color, 0.2),
        color: updateOpacity(color, 0.8),
      }}
    >
      {label}
    </div>
  );
};

export default GradeIndicator;
