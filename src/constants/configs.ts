import { BrowserOptions } from '@sentry/react';

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

export const SERVER_ID =
  process.env.NODE_ENV === 'production' ? 'eisbgazs16' : 'd8r6qarg78';

export const SERVER_ADDR = `https://${SERVER_ID}.execute-api.${AWS_REGION}.amazonaws.com/Prod`;

export const SERVER_CONFIG = {
  URI: `${SERVER_ADDR}/graphql`,
};

export const SentryConfigs: BrowserOptions = {
  dsn:
    process.env.NODE_ENV === 'production'
      ? 'https://c38359448a5448a58971eeb211568473@o861810.ingest.sentry.io/5821571'
      : '',
  tracesSampleRate: 0.3,
};

export const CURRENT_TERM = '2021-22 Term 2';

export const WINDOW_LEAVE_MESSAGES = {
  REVIEW_EDIT:
    'Are you sure you want to leave? (Review will be saved as draft)',
};
