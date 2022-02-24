import '../../styles/components/atoms/GradeIndicator.scss';
import colors from '../../constants/colors';
import updateOpacity from '../../helpers/updateOpacity';
import { getLabel } from '../../helpers';

type GradeIndicatorProps = {
  grade: string | number;
  additionalClassName?: string;
};

export default function GradeIndicator({
  grade,
  additionalClassName,
}: GradeIndicatorProps) {
  const label = getLabel(grade);
  const color = colors.gradeColors[label.charAt(0)];
  return (
    <div
      className={`grade-indicator${
        additionalClassName ? ` ${additionalClassName}` : ''
      }`}
      style={{
        background: updateOpacity(color, 0.2),
        color: updateOpacity(color, 0.8),
      }}
    >
      {label}
    </div>
  );
}
