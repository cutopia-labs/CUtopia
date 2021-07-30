import { ApolloError } from '@apollo/client';
import { ERROR_MESSAGES } from '../constants/errors';
import NotificationStore from '../store/NotificationStore';

const handleError = (e: ApolloError, notification: NotificationStore) => {
  notification.setSnackBar({
    message: ERROR_MESSAGES[parseInt(e.message, 10)] || e.message,
    severity: 'error',
  });
};

export default handleError;
