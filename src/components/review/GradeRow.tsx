import clsx from 'clsx';
import { FC } from 'react';

import { RATING_FIELDS } from '../../constants';
import { CourseRating, Review } from '../../types';
import GradeIndicator from '../atoms/GradeIndicator';
import styles from '../../styles/components/review/GradeRow.module.scss';

type GradeRowProps = {
  rating: Review | CourseRating;
  isReview?: boolean;
  selected?: string;
  setSelected?: (label: string) => void;
  style?: string;
  additionalChildClassName?: string;
  isMobile?: boolean;
  concise?: boolean;
};

const GradeRow: FC<GradeRowProps> = ({
  rating,
  children,
  isReview,
  selected,
  setSelected,
  concise,
  style,
  additionalChildClassName,
  isMobile,
}) => (
  <div className={clsx(styles.gradeRow, style, concise && styles.concise)}>
    {['overall', ...RATING_FIELDS]
      .filter(x => x)
      .map(field => (
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
            <div className="reviewsFilterLabel" key={field}>
              {`${field}${isMobile ? '' : ':'}`}
            </div>
          )}
          <GradeIndicator
            grade={
              isReview && field !== 'overall'
                ? rating[field].grade
                : rating[field]
            }
            style={styles.reviewsFilterGradeIndicator}
          />
        </div>
      ))}
    {children}
  </div>
);

export default GradeRow;
