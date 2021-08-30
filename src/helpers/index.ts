import { VALUE_TO_LETTER, GRADE_VALUES, GRADES } from '../constants';
import { VALID_COURSE_RULE } from '../constants/rules';
import { Review } from '../types';

export const getSubjectAndCode = (courseId: string) => ({
  subject: courseId.substring(0, 4),
  code: courseId.substring(4),
});

export const generateRandomArray = (
  length: number,
  limit: number
): Set<number> => {
  const result: Set<number> = new Set();
  while (result.size < length) {
    result.add(Math.floor(Math.random() * limit));
  }
  return result;
};

export const hashing = (str: string, len: number) =>
  (str || '')
    .split('')
    .slice(0, 10)
    .reduce((acc, curr) => acc + curr.charCodeAt(0), 0) % len;

export const reverseMapping = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export const validCourse = (coursename: string) => {
  return VALID_COURSE_RULE.test(coursename);
};

export const getLabel = (grade: number | string) => {
  if (Number.isInteger(grade) && grade >= 0 && grade <= 4) {
    return GRADES[grade];
  }
  for (const key of GRADE_VALUES) {
    if (grade > key - 0.1) return VALUE_TO_LETTER[key];
  }
  return 'F';
};

export const getReviewId = (review: Review) =>
  `${review.courseId}#${review.createdAt}`;
