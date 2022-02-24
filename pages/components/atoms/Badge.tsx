import './Badge.scss';
import clsx from 'clsx';
import updateOpacity from '../../helpers/updateOpacity';
import colors from '../../constants/colors';

type BadgeProps = {
  index?: number;
  text: string;
  value?: string;
  isGrade?: boolean;
  color?: string;
};

const Badge = ({
  index,
  text,
  value,
  isGrade,
  color,
  className,
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  const badgeColor = isGrade
    ? colors.gradeColors[value]
    : colors.randomColors[
        index >= colors.randomColors.length
          ? index % colors.randomColors.length
          : index
      ];
  return (
    <span
      className={clsx('badge', className)}
      style={{
        backgroundColor: color || updateOpacity(badgeColor, isGrade ? 1 : 0.7),
      }}
    >
      <span className="badge-text">{text}</span>
      {Boolean(value) && <p className="badge-text-value">{`${value}`}</p>}
    </span>
  );
};

export default Badge;
