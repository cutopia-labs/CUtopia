import React from 'react';

import { RATING_FIELDS } from '../../constants/states';
import GradeIndicator from '../GradeIndicator';
import './GradeRow.css';

const GradeRow = ({
  rating, children, additionalClassName, isReview, selected, setSelected,
}) => (
  <div className={`grade-row${additionalClassName ? ` ${additionalClassName}` : ''}`}>
    <div className="center-row">
      {!isReview
      && (
        <GradeIndicator
          grade={rating.overall}
          additionalClassName="course-summary-grade-indicator overall"
        />
      )}
      {
        RATING_FIELDS.map(field => (
          <div
            key={field}
            className={`center-row rating-container${selected === field ? ' active' : ''}`}
            onClick={() => {
              if (setSelected) {
                setSelected(field);
              }
            }}
          >
            <div className="course-summary-label" key={field}>{`${field}:`}</div>
            <GradeIndicator
              grade={isReview ? rating[field].grade : rating[field]}
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
