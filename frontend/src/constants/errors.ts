import { ErrorCode } from 'cutopia-types';

export const ERROR_MESSAGES = {
  [ErrorCode.AUTHORIZATION_INVALID_TOKEN]: 'Invalid token, please login again',
  [ErrorCode.INVALID_COURSE_ID]: 'Invalid courseId',
  [ErrorCode.CREATE_USER_INVALID_EMAIL]: 'Invalid SID',
  [ErrorCode.CREATE_USER_USERNAME_EXISTS]: 'Username already exist!',
  [ErrorCode.CREATE_USER_EMAIL_EXISTS]: 'SID already exist!',
  [ErrorCode.VERIFICATION_FAILED]: 'Failed to verify',
  [ErrorCode.VERIFICATION_ALREADY_VERIFIED]: 'CUHK SID already verified!',
  [ErrorCode.VERIFICATION_USER_DNE]: "User doesn't exist!",
  [ErrorCode.VERIFICATION_EXPIRED]:
    'Verification expired, please sign up again!',
  [ErrorCode.LOGIN_FAILED]: 'Wrong password!',
  [ErrorCode.LOGIN_USER_DNE]: "Username doesn't exist!",
  [ErrorCode.LOGIN_NOT_VERIFIED]: 'Account not verified!',
  [ErrorCode.GET_PASSWORD_USER_DNE]: "Username doesn't exist!",
  [ErrorCode.GET_PASSWORD_NOT_VERIFIED]: 'Not verified!',
  [ErrorCode.RESET_PASSWORD_FAILED]: 'Failed to reset password',
  [ErrorCode.RESET_PASSWORD_USER_DNE]: "Username doesn't exist!",
  [ErrorCode.RESET_PASSWORD_NOT_VERIFIED]: 'Not verified!',
  [ErrorCode.CREATE_REVIEW_ALREADY_CREATED]: 'Already created review!',
  [ErrorCode.VOTE_REVIEW_INVALID_VALUE]: 'Invalid voting',
  [ErrorCode.VOTE_REVIEW_VOTED_ALREADY]: 'Voted already!',
  [ErrorCode.UPLOAD_TIMETABLE_EXCEED_ENTRY_LIMIT]:
    'Timetable exceed 10 courses! Please remove some and retry.',
  [ErrorCode.UPLOAD_TIMETABLE_EXCEED_TOTAL_LIMIT]:
    'Exceed upload limit, please delete remote timetable before upload!',
  [ErrorCode.GET_REVIEW_INVALID_SORTING]: 'Invalid sorting!',
  [ErrorCode.GET_TIMETABLE_INVALID_ID]: 'Invalid timetable id!',
  [ErrorCode.GET_TIMETABLE_UNAUTHORIZED]: 'Private timetable, failed to load!',
  [ErrorCode.GET_TIMETABLE_EXPIRED]: 'Link expired!',
  [ErrorCode.DEL_TIMETABLE_INVALID_ID]: 'Failed to delete (invalid id)!',
  [ErrorCode.INPUT_INVALID_LENGTH]: 'Invalid input length!',
  [ErrorCode.INPUT_INVALID_VALUE]: 'Invalid input value!',
  [ErrorCode.EXCEED_RATE_LIMIT]: 'Too fast, please try again later!',
};
