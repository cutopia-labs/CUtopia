import React from 'react';

import { RATING_FIELDS } from '../../constants/states';
import GradeIndicator from '../GradeIndicator';
import './GradeRow.css';

const GradeRow = ({
  rating, children, isReview, selected, setSelected, additionalClassName, additionalChildClassName, isMobile,
}) => (
  <div className={`grade-row${additionalClassName ? ` ${additionalClassName}` : ''}`}>
    <div className="center-row">
      {
        !isReview &&
        (
          <GradeIndicator
            grade={rating.overall}
            additionalClassName={`course-summary-grade-indicator${isReview ? '' : ' overall'}`}
          />
        )
      }
      {
        [isReview ? 'overall' : false, ...RATING_FIELDS].filter(x => x).map(field => (
          <div
            key={field}
            className={`center-row rating-container${selected === field ? ' active' : ''}${additionalChildClassName ? ` ${additionalChildClassName}` : ''}`}
            onClick={() => {
              if (setSelected && !isMobile) {
                setSelected(field);
              }
            }}
          >
            {
              field !== 'overall' &&
              <div className="course-summary-label" key={field}>{`${field}${isMobile ? '' : ':'}`}</div>
            }
            <GradeIndicator
              grade={isReview && field !== 'overall' ? rating[field].grade : rating[field]}
              additionalClassName="course-summary-grade-indicator"
            />
          </div>
        ))
      }
    </div>
    {children}
  </div>
);

export default GradeRow;
