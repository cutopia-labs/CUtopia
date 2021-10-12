import { ApolloError } from '@apollo/client';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { ERROR_MESSAGES } from '../constants/errors';
import { userStore } from '../store';
import ViewStore from '../store/ViewStore';

const handleError = (e: ApolloError, view: ViewStore) => {
  const err_code = parseInt(e.message, 10);
  // Clear the invalid token and log out
  if (err_code === ErrorCode.AUTHORIZATION_INVALID_TOKEN) {
    console.log('Invalid token, logging out!');
    userStore.logout();
  }
  view.setSnackBar({
    message: ERROR_MESSAGES[err_code] || e.message,
    severity: 'error',
  });
};

export default handleError;
