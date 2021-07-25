import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import { RATING_FIELDS } from '../../constants/states';
import { CourseRating, Review } from '../../types';
import GradeIndicator from '../atoms/GradeIndicator';
import './GradeRow.scss';

type GradeRowProps = {
  rating: Review | CourseRating;
  isReview?: boolean;
  selected?: string;
  setSelected?: (label: string) => void;
  additionalClassName?: string;
  additionalChildClassName?: string;
  isMobile?: boolean;
};

const GradeRow = ({
  rating,
  children,
  isReview,
  selected,
  setSelected,
  additionalClassName,
  additionalChildClassName,
  isMobile,
}: PropsWithChildren<GradeRowProps>) => (
  <div className={clsx('grade-row', additionalClassName)}>
    {!isReview && (
      <GradeIndicator
        grade={rating.overall}
        additionalClassName={clsx(
          'course-summary-grade-indicator',
          !isReview && 'overall'
        )}
      />
    )}
    {[isReview ? 'overall' : '', ...RATING_FIELDS]
      .filter((x) => x)
      .map((field) => (
        <div
          key={field}
          className={clsx(
            'center-row rating-container',
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
            <div className="course-summary-label" key={field}>
              {`${field}${isMobile ? '' : ':'}`}
            </div>
          )}
          <GradeIndicator
            grade={
              isReview && field !== 'overall'
                ? rating[field].grade
                : rating[field]
            }
            additionalClassName="course-summary-grade-indicator"
          />
        </div>
      ))}
    {children}
  </div>
);

export default GradeRow;
