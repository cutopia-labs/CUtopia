import { CourseSection, Grade, RatingField } from '../types';

export const CREATE_PLANNER_FLAG = 'CREATE';

export const NON_SHARE_EXPIRE = -1;

export const EXPIRE_LOOKUP = {
  share: 7, // just to indicate share, the days shall be configurable
  shareableUpload: 0,
  upload: -1,
  default: undefined,
};

export const RATING_FIELDS = [
  'grading',
  'teaching',
  'difficulty',
  'content',
] as RatingField[];

export const LETTER_TO_VALUE = Object.freeze({
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

export const VALUE_TO_LETTER = Object.freeze({
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

export const GRADES = Object.freeze(['F', 'D', 'C', 'B', 'A']) as Grade[];

export const GRADE_VALUES = Object.freeze([
  4, 3.7, 3.3, 3, 2.7, 2.3, 2, 1.7, 1, 0,
]);

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS_TWO_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const VOTE_ACTIONS = Object.freeze({
  UPVOTE: 1,
  DOWNVOTE: 0,
});

export const TOKEN_EXPIRE_DAYS = 7;
export const VIEWS_LIMIT = 5;

export const UGE_COURSE_CODES = ['UGEA', 'UGEB', 'UGEC', 'UGED'];

export const EMOJIS = [
  '🦦',
  '🦝',
  '🐨',
  '🐼',
  '🐶',
  '🐧',
  '🐱',
  '🐤',
  '🦑',
  '🦉',
  '🐸',
  '🦊',
  '🐘',
  '🦋',
  '🦈',
  '🪶',
  '🦜',
  '🦔',
];

export const EMOJIS_LENGTH = 18;

export const makeSectionLabel = (section: CourseSection, courseId: string) =>
  `${courseId} ${section.name}`;

export const INSTRUCTOR_PREFIXS = [
  'ms',
  'dr',
  'mr',
  'miss',
  'prof',
  'professor',
];

export const INSTRUCTOR_PREFIXS_LEN = 6;
