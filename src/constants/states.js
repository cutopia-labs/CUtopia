const RATING_FIELDS = ['grading', 'teaching', 'difficulty', 'content'];

const MODES = Object.freeze({
  CUSIS: 0,
  CUTOPIA_LOGIN: 1,
  CUTOPIA_SIGNUP: 2,
  VERIFY: 3,
  RESET_PASSWORD: 4,
  RESET_PASSWORD_VERIFY: 5,
});

const CHECK_USER_EXIST_CODES = Object.freeze({
  USERNAME_EMAIL_AVAILABLE: 0,
  USERNAME_EXIST: 1,
  EMAIL_EXIST: 2,
});

const LOGIN_STATES = Object.freeze({
  LOGGED_OUT: 0,
  LOGGED_IN_CUSIS: 1,
  LOGGED_IN_CUTOPIA: 2,
});

const VERIFICATION_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  ALREADY_VERIFIED: 2,
  USER_DNE: 3,
});

const LOGIN_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  USER_DNE: 2,
});

const LETTER_TO_VALUE = Object.freeze({
  A: 4,
  'A-': 3.7,
  'B+': 3.3,
  B: 3,
  'B-': 2.7,
  'C+': 2.3,
  C: 2,
  'C-': 1.7,
  D: 1,
  F: 0,
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

const GRADES = Object.freeze(['F', 'D', 'C', 'B', 'A']);

const GRADE_VALUES = Object.freeze([4, 3.7, 3.3, 3, 2.7, 2.3, 2, 1.7, 1, 0]);

const LETTER_TO_FIVE_VALUES = Object.freeze({
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0,
});

const TIMETABLE_CONSTANTS = Object.freeze({
  START_HOUR: 8,
  END_HOUR: 19,
  NO_OF_HOURS: 12,
  NO_OF_DAYS: 6,
  LEFT_BAR_WIDTH: 52,
  CELL_WIDTH: 52,
  CELL_HEIGHT: 52,
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
  MODES,
  LOGIN_STATES,
  VERIFICATION_CODES,
  LOGIN_CODES,
  CHECK_USER_EXIST_CODES,
  LETTER_TO_VALUE,
  VALUE_TO_LETTER,
  TIMETABLE_CONSTANTS,
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
