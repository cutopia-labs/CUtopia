import clsx from 'clsx';
import { FC } from 'react';
import colors from '../../constants/colors';
import updateOpacity from '../../helpers/updateOpacity';
import { getLabel } from '../../helpers';
import styles from '../../styles/components/atoms/GradeIndicator.module.scss';

type GradeIndicatorProps = {
  grade: string | number;
  style?: string;
};

const GradeIndicator: FC<GradeIndicatorProps> = ({ grade, style }) => {
  const label = getLabel(grade);
  const color = colors.gradeColors[label.charAt(0)];
  return (
    <div
      className={clsx(styles.gradeIndicator, style)}
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
