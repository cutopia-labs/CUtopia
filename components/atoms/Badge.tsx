import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/atoms/Badge.module.scss';
import updateOpacity from '../../helpers/updateOpacity';
import colors from '../../constants/colors';

type BadgeProps = {
  index?: number;
  text: string;
  value?: string;
  isGrade?: boolean;
  color?: string;
};

const Badge: FC<BadgeProps & React.HTMLAttributes<HTMLSpanElement>> = ({
  index,
  text,
  value,
  isGrade,
  color,
  className,
}) => {
  const badgeColor = isGrade
    ? colors.gradeColors[value]
    : colors.randomColors[
        index >= colors.randomColors.length
          ? index % colors.randomColors.length
          : index
      ];
  return (
    <span
      className={clsx(styles.badge, className)}
      style={{
        backgroundColor: color || updateOpacity(badgeColor, isGrade ? 1 : 0.7),
      }}
    >
      <span className={styles.badgeText}>{text}</span>
      {Boolean(value) && <p className={styles.badgeTextValue}>{`${value}`}</p>}
    </span>
  );
};

export default Badge;
