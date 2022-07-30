import { DataConfig } from './types';

export const LAZY_LOAD_BUFFER = 50;
export const SNACKBAR_TIMEOUT = 5000;
export const COURSE_CARD_MAX_HEIGHT = 580;
export const TARGET_REVIEW_WORD_COUNT = 80;
export const HISTORY_MAX_LENGTH = 8;
export const MAX_SEARCH_RESULT_LENGTH = 40;
export const FULL_MEMBER_LEVEL = 2;
export const LEVEL_UP_EXP = 5;
export const FULL_MEMBER_EXP = (FULL_MEMBER_LEVEL - 1) * LEVEL_UP_EXP;
export const REVIEW_EXP = 3;
export const SIMILAR_COURSE_LIMIT = 5;
export const MESSAGE_PREVIEW_LENGTH = 10;
export const MESSAGES_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 10;

export const SAVE_DRAFT_PROGRESS_BUFFER = 25;

export const PLANNER_CONFIGS = {
  DEFAULT_TABLE_NAME: 'New Timetable',
};

export const MIN_DESKTOP_WIDTH = 1260;

const AWS_REGION = 'ap-southeast-1';

/**
 * Server ID List
 * production: eisbgazs16
 * plus-dev: d8r6qarg78
 * mike-dev: uvp03fp791
 */
export const SERVER_ID =
  process.env.NODE_ENV === 'production' ? 'eisbgazs16' : 'f6le32w9fj';

export const SERVER_ADDR = `https://${SERVER_ID}.execute-api.${AWS_REGION}.amazonaws.com/Prod`;

export const SERVER_CONFIG = {
  URI: `${SERVER_ADDR}/graphql`,
};

// Return only current term sections in planner
export const CURRENT_TERM = '2022-23 Term 1';

// Update course list and instructors if etag before below
export const STATICS_EXPIRE_BEFORE = 1659206582000;

export const DATA_CONFIGS: Record<string, DataConfig> = {
  courseList: {
    expire: STATICS_EXPIRE_BEFORE,
    fetchKey: 'course_list',
  },
  instructors: {
    expire: STATICS_EXPIRE_BEFORE,
  },
};

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

export const TIMETABLE_SYNC_INTERVAL = 4000;

export const META_DESCRIPTION_CHAR_LIMIT = 150;

export const DEFAULT_DESCRIPTION =
  'CUtopia is a course review and planning platform for CUHK students.';
