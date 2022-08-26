import clsx from 'clsx';

import { RATING_FIELDS } from '../../constants';
import { CourseRating, Review } from '../../types';
import GradeIndicator from '../atoms/GradeIndicator';
import styles from '../../styles/components/review/GradeRow.module.scss';
import { FCC } from '../../types/general';

type GradeRowProps = {
  rating: Review | CourseRating;
  isReview?: boolean;
  selected?: string;
  setSelected?: (label: string) => void;
  style?: string;
  gradeIndicatorStyle?: string;
  additionalChildClassName?: string;
  isMobile?: boolean;
  concise?: boolean;
};

const GradeRow: FCC<GradeRowProps> = ({
  rating,
  children,
  isReview,
  selected,
  setSelected,
  concise,
  style,
  additionalChildClassName,
  gradeIndicatorStyle,
  isMobile,
}) => (
  <div className={clsx(styles.gradeRow, concise && styles.concise, style)}>
    {['overall', ...RATING_FIELDS].map(field => (
      <div
        key={field}
        className={clsx(
          styles.ratingContainer,
          'center-row',
          selected === field && 'active',
          additionalChildClassName
        )}
        onClick={() => {
          if (setSelected && !isMobile) {
            setSelected(field);
          }
        }}
      >
        {field !== 'overall' && (
          <div
            className={clsx('reviewsFilterLabel', styles.reviewsFilterLabel)}
            key={field}
          >
            {`${field}${isMobile ? '' : ':'}`}
          </div>
        )}
        <GradeIndicator
          grade={
            isReview && field !== 'overall'
              ? rating[field].grade
              : rating[field]
          }
          style={clsx(styles.reviewsFilterGradeIndicator, gradeIndicatorStyle)}
        />
      </div>
    ))}
    {children}
  </div>
);

export default GradeRow;
