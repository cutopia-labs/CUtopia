import { VALUE_TO_LETTER, GRADE_VALUES, GRADES } from '../constants/states';

const validCourse = (coursename) => {
  const rules = new RegExp(/^[a-z]{4}\d{4}$/i);
  return rules.test(coursename);
};

const getLabel = (grade) => {
  if (Number.isInteger(grade) && grade >= 0 && grade <= 4) {
    return GRADES[grade];
  }
  for (const key of GRADE_VALUES) {
    if (grade > key - 0.1) return VALUE_TO_LETTER[key];
  }
  return 'F';
};

export { validCourse, getLabel };
