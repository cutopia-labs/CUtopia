import React from 'react';

import './GradeIndicator.css';
import colors from '../constants/colors';
import updateOpacity from '../helpers/updateOpacity';
import { floatToGrade } from '../helpers/marcos';
import { VALUE_TO_LETTER, GRADES } from '../constants/states';

const getLabel = grade => {
  if (typeof grade === 'string') return grade;
  if (grade >= 0 && grade <= 4) {
    return floatToGrade(grade);
  }
  return grade;
};

export default function GradeIndicator({ grade, additionalClassName }) {
  const color = colors.gradeColors[getLabel(grade).charAt(0)];
  return (
    <div
      className={`grade-indicator${additionalClassName ? ` ${additionalClassName}` : ''}`}
      style={{
        backgroundColor: updateOpacity(color, 0.3),
        color: updateOpacity(color, 0.8),
      }}
    >
      {
        typeof grade === 'string' ? grade : getLabel(grade)
      }
    </div>
  );
}
