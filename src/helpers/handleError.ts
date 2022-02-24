// @ts-nocheck

import { ApolloError } from '@apollo/client';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { ERROR_MESSAGES } from '../constants/errors';
import { userStore } from '../store';
import ViewStore from '../store/ViewStore';

const handleError = (e: ApolloError, view: ViewStore) => {
  const err_code = parseInt(e.message, 10);
  const customErrors = isNaN(err_code) ? e.networkError?.result?.errors : null;
  // Clear the invalid token and log out
  if (
    customErrors?.length &&
    parseInt(customErrors[0]?.extensions?.code, 10) ===
      ErrorCode.AUTHORIZATION_INVALID_TOKEN
  ) {
    console.log('Invalid token, logging out!');
    userStore.logout();
    const refreshedToken = customErrors[0]?.extensions?.refreshedToken;
    if (refreshedToken) {
      userStore.saveToken(refreshedToken);
    }
  }
  view.setSnackBar({
    message: ERROR_MESSAGES[err_code] || e.message,
    severity: 'error',
  });
};

export default handleError;
