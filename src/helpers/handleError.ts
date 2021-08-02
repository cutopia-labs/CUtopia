import { ApolloError } from '@apollo/client';
import { ERROR_MESSAGES } from '../constants/errors';
import ViewStore from '../store/ViewStore';

const handleError = (e: ApolloError, view: ViewStore) => {
  view.setSnackBar({
    message: ERROR_MESSAGES[parseInt(e.message, 10)] || e.message,
    severity: 'error',
  });
};

export default handleError;
