import { ERROR_CODES } from '../types';

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTHORIZATION_REQUIRES_LOGIN]: 'Requires Login',
  [ERROR_CODES.AUTHORIZATION_REQUIRES_OWNER]:
    'No permission for the action (Not Owner)',
  [ERROR_CODES.CHECK_USER_USERNAME_EXISTS]: 'Username already exist!',
  [ERROR_CODES.CHECK_USER_EMAIL_EXISTS]: 'SID already exist!',
  [ERROR_CODES.VERIFICATION_FAILED]: 'Failed to verify',
  [ERROR_CODES.VERIFICATION_ALREADY_VERIFIED]: 'CUHK SID already verified!',
  [ERROR_CODES.VERIFICATION_USER_DNE]: "User doesn't exist!",
  [ERROR_CODES.LOGIN_FAILED]: 'Wrong password!',
  [ERROR_CODES.LOGIN_USER_DNE]: "Username doesn't exist!",
  [ERROR_CODES.GET_PASSWORD_USER_DNE]: "Username doesn't exist!",
  [ERROR_CODES.GET_PASSWORD_NOT_VERIFIED]: 'Not verified!',
  [ERROR_CODES.RESET_PASSWORD_FAILED]: 'Failed to reset password',
  [ERROR_CODES.RESET_PASSWORD_USER_DNE]: "Username doesn't exist!",
  [ERROR_CODES.RESET_PASSWORD_NOT_VERIFIED]: 'Not verified!',
  [ERROR_CODES.VOTE_REVIEW_INVALID_VALUE]: 'Invalid voting',
  [ERROR_CODES.VOTE_REVIEW_VOTED_ALREADY]: 'Voted already!',
  [ERROR_CODES.GET_REVIEW_INVALID_SORTING]: 'Invalid sorting!',
  [ERROR_CODES.GET_TIMETABLE_INVALID_ID]: 'Invalid timetable id!',
  [ERROR_CODES.GET_TIMETABLE_EXPIRED]: 'Link expired!',
  [ERROR_CODES.INPUT_INVALID_LENGTH]: 'Invalid input length!',
  [ERROR_CODES.INPUT_INVALID_VALUE]: 'Invalid input value!',
};
