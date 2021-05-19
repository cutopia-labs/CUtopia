import { VALUE_TO_LETTER, GRADE_VALUES } from '../constants/states';

const validCourse = coursename => {
  const rules = new RegExp(/^[a-z]{4}\d{4}$/i);
  return rules.test(coursename);
};

const floatToGrade = value => {
  for (const key of GRADE_VALUES) {
    if (value > (key - 0.1)) return VALUE_TO_LETTER[key];
  }
  return 'F';
};

export {
  validCourse,
  floatToGrade,
};
