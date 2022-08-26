import { VALID_COURSE_RULE } from 'cutopia-types/lib/rules';
import {
  VALUE_TO_LETTER,
  GRADE_VALUES,
  GRADES,
  TOKEN_EXPIRE_DAYS,
} from '../constants';
import { MIN_DESKTOP_WIDTH } from '../config';
import { Review } from '../types';
import { getStoreData } from './store';

export const wait = (timeInMs: number) =>
  new Promise(resolve => setTimeout(resolve, timeInMs));

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

export const removeEmptyValues = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v));

export const getTokenExpireDate = (
  timestamp: number,
  deltaInDays: number = TOKEN_EXPIRE_DAYS
) => {
  return (timestamp += 60 * 60 * 24 * 1000 * deltaInDays);
};

export const getToken = () => getStoreData('token')?.token;

export const isServer = typeof window === 'undefined';

export const getAttrs = (obj: Record<string, any>, ...attrs: string[]) =>
  Object.fromEntries(
    attrs.filter(attr => attr in obj).map(attr => [attr, obj[attr]])
  );

export const objStrEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const jsonCloneDeep = obj => JSON.parse(JSON.stringify(obj));

export const isMobileQuery = () => {
  const mqList = window.matchMedia(`(max-width:${MIN_DESKTOP_WIDTH}px)`);
  return mqList.matches;
};

export const trimEllip = (str: string, len: number) => {
  return str.length > len ? `${str.substring(0, len).trim()}...` : str;
};
