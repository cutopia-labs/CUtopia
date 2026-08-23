import { DataConfig } from './types';
import { resolveServerConfig } from './helpers/serverConfig';

export const LAZY_LOAD_BUFFER = 50;
export const SNACKBAR_TIMEOUT = 5000;
export const COURSE_CARD_MAX_HEIGHT = 580;
export const TARGET_REVIEW_WORD_COUNT = 80;
export const HISTORY_MAX_LENGTH = 8;
export const MAX_SEARCH_RESULT_LENGTH = 40;
export const FULL_MEMBER_LEVEL = 2;
export const LEVEL_UP_EXP = 5;
export const FULL_MEMBER_EXP = (FULL_MEMBER_LEVEL - 1) * LEVEL_UP_EXP;
export const SIMILAR_COURSE_LIMIT = 5;
export const REVIEWS_PER_PAGE = 10;

/** Save reviews when progress > buffer */
export const SAVE_DRAFT_PROGRESS_BUFFER = 25;

export const PLANNER_CONFIGS = {
  DEFAULT_TABLE_NAME: 'New Timetable',
};

/** Render mobile view when < this number */
export const MIN_DESKTOP_WIDTH = 1260;

export const isDev =
  process.env.NODE_ENV === 'development' ||
  ['dev', 'staging'].includes(
    process.env.REACT_APP_ENV_MODE?.trim().toLowerCase()
  );

const resolvedServerConfig = resolveServerConfig(
  process.env.NODE_ENV,
  process.env.REACT_APP_ENV_MODE
);

export const SERVER_ID = resolvedServerConfig.id;
export const SERVER_ADDR = resolvedServerConfig.address;

export const SERVER_CONFIG = {
  URI: `${SERVER_ADDR}/graphql`,
};

/** Return current term sections by default in planner */
export const CURRENT_TERM = process.env.REACT_APP_CURRENT_TERM;

/**
 * All available terms options in planner
 * - If current term is 1, then show term 2 as well in planner
 */
export const plannerTerms = CURRENT_TERM.endsWith('1')
  ? [CURRENT_TERM, `${CURRENT_TERM.slice(0, -1)}2`]
  : [CURRENT_TERM];

/** Update course list and instructors if etag before below */
export const STATICS_EXPIRE_BEFORE = parseInt(
  process.env.REACT_APP_LAST_DATA_UPDATE,
  10
);

/** All remote data to be loaded in datastore on demand */
export const DATA_CONFIGS: Record<string, DataConfig> = {
  courseList: {
    expire: STATICS_EXPIRE_BEFORE,
    fetchKey: 'course_list',
  },
  instructors: {
    expire: STATICS_EXPIRE_BEFORE,
  },
};

/** If token BE format is updated, then remove FE expired token */
export const TOKEN_EXPIRE_BEFORE = 1636518372000;

export const LOGIN_REDIRECT_PAGE = '/review';

export const PLANNER_COURSE_INFO_ATTRS = [
  'units',
  'title',
  'academic_group',
  'terms',
  'requirements',
];

export const REVIEW_COURSE_INFO_ATTRS = [
  'units',
  'title',
  'components',
  'requirements',
  'description',
  'academic_group',
  'assessments',
  'courseId', // Needed for title SSR
];

/** How frequent timetable is synced */
export const TIMETABLE_SYNC_INTERVAL = 4000;

/** SEO: description length */
export const META_DESCRIPTION_CHAR_LIMIT = 160;

/** Default SEO head */
export const DEFAULT_HEAD = {
  title: 'CUtopia - CUHK Course Review and Planning Platform',
  description:
    'CUtopia is a course review and timetable planning website for CUHK students. It provides a platform for students to share their opinions and pick the course that best fits them.',
};

/** Head for noindex pages */
export const DEFAULT_NO_SEO_DOC = DEFAULT_HEAD;

/** Timetable Config */
export const DEFAULT_EVENT_CONFIG = {
  startHour: 8,
  endHour: 18,
  numOfDays: 5,
  numOfHours: 12,
};
