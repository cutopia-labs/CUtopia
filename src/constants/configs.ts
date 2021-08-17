import { BrowserOptions } from '@sentry/react';

export const LAZY_LOAD_BUFFER = 50;
export const COURSE_PANEL_FUNCTION_BAR_FLOAT_BUFFER = window.innerHeight * 2;
export const SNACKBAR_TIMEOUT = 5000;
export const COURSE_CARD_MAX_HEIGHT = 580;
export const TARGET_REVIEW_WORD_COUNT = 80;
export const HISTORY_MAX_LENGTH = 3;
export const MAX_SEARCH_RESULT_LENGTH = 40;
export const FULL_MEMBER_LEVEL = 2;
export const LEVEL_UP_EXP = 5;
export const FULL_MEMBER_EXP = (FULL_MEMBER_LEVEL - 1) * LEVEL_UP_EXP;
export const REVIEW_EXP = 3;

export const PLANNER_CONFIGS = {
  DEFAULT_TABLE_NAME: 'New Timetable',
};

export const MIN_DESKTOP_WIDTH = 1260;

const SERVER_ID =
  process.env.NODE_ENV === 'production' ? 'vqx877xyad' : 'uqtx8qgnz5';

export const SERVER_CONFIG = {
  URI: `https://${SERVER_ID}.execute-api.ap-northeast-1.amazonaws.com/Prod/graphql`,
};

export const SentryConfigs: BrowserOptions = {
  dsn:
    process.env.NODE_ENV === 'production'
      ? 'https://c38359448a5448a58971eeb211568473@o861810.ingest.sentry.io/5821571'
      : '',
  tracesSampleRate: 0.3,
};

export const CURRENT_TERM = '2021-22 Term 1';
