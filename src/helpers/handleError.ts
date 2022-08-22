import { ApolloError } from '@apollo/client';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { ERROR_MESSAGES } from '../constants/errors';
import { userStore } from '../store';
import ViewStore from '../store/ViewStore';

const handleError = (e: ApolloError, view: ViewStore): boolean | null => {
  const err_code = parseInt(e.message, 10);
  // @ts-ignore
  const customErrors = isNaN(err_code) ? e.networkError?.result?.errors : null;
  const alt_code = customErrors?.length
    ? parseInt(customErrors[0]?.extensions?.code, 10)
    : null;
  // Clear the invalid token and log out
  if (
    err_code === ErrorCode.AUTHORIZATION_INVALID_TOKEN ||
    alt_code === ErrorCode.AUTHORIZATION_REFRESH_TOKEN ||
    alt_code === ErrorCode.AUTHORIZATION_INVALID_TOKEN
  ) {
    if (alt_code === ErrorCode.AUTHORIZATION_REFRESH_TOKEN) {
      userStore.saveToken(customErrors[0]?.extensions?.refreshedToken);
      // Return true for index.tsx not to logout
      return true;
    } else {
      userStore.logout();
      return; // Do not show error, cuz it's confusing, just let them login again
    }
  }
  view.setSnackBar({
    message: ERROR_MESSAGES[err_code] || e.message,
    severity: 'error',
  });
};

export default handleError;
