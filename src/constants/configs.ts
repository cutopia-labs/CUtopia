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

export const TIMETABLE_CONSTANTS = Object.freeze({
  START_HOUR: 8,
  END_HOUR: 19,
  NO_OF_HOURS: 12,
  NO_OF_DAYS: 6,
  LEFT_BAR_WIDTH: 52,
  CELL_WIDTH: 52,
  CELL_HEIGHT: 52,
});

export const PLANNER_CONFIGS = {
  DEFAULT_TABLE_NAME: 'New Timetable',
};

export const MIN_DESKTOP_WIDTH = 1260;

export const SERVER_CONFIG = {
  URI: 'https://uqtx8qgnz5.execute-api.ap-northeast-1.amazonaws.com/Stage/graphql',
};

export const SentryConfigs: BrowserOptions = {
  dsn: 'https://c38359448a5448a58971eeb211568473@o861810.ingest.sentry.io/5821571',
  tracesSampleRate: 0.3,
};
