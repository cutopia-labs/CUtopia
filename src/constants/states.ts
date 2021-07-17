import { Grade, RatingField } from '../types';

const RATING_FIELDS = [
  'grading',
  'teaching',
  'difficulty',
  'content',
] as RatingField[];

const LETTER_TO_VALUE = Object.freeze({
  'A': 4,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2,
  'C-': 1.7,
  'D': 1,
  'F': 0,
});

const VALUE_TO_LETTER = Object.freeze({
  4: 'A',
  3.7: 'A-',
  3.3: 'B+',
  3: 'B',
  2.7: 'B-',
  2.3: 'C+',
  2: 'C',
  1.7: 'C-',
  1: 'D',
  0: 'F',
});

const GRADES = Object.freeze(['F', 'D', 'C', 'B', 'A']) as Grade[];

const GRADE_VALUES = Object.freeze([4, 3.7, 3.3, 3, 2.7, 2.3, 2, 1.7, 1, 0]);

const LETTER_TO_FIVE_VALUES = Object.freeze({
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0,
});

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_TWO_ABBR = ['', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const VOTE_ACTIONS = Object.freeze({
  UPVOTE: 1,
  DOWNVOTE: 0,
});

const TOKEN_EXPIRE_DAYS = 7;
const VIEWS_LIMIT = 5;
const FULL_MEMBER_REVIEWS = 3;

export {
  RATING_FIELDS,
  LETTER_TO_VALUE,
  VALUE_TO_LETTER,
  WEEKDAYS,
  WEEKDAYS_TWO_ABBR,
  GRADES,
  GRADE_VALUES,
  LETTER_TO_FIVE_VALUES,
  VOTE_ACTIONS,
  TOKEN_EXPIRE_DAYS,
  VIEWS_LIMIT,
  FULL_MEMBER_REVIEWS,
};
