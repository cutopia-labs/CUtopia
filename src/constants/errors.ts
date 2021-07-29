import { ERROR_CODES } from '../types';

export const ERROR_MESSAGES = {
  [ERROR_CODES.CHECK_USER_USERNAME_ALREADY_EXISTS]: 'Username already exist!',
  [ERROR_CODES.CHECK_USER_USER_EMAIL_ALREADY_EXISTS]: 'SID already exist!',
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
};
