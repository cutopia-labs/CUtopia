import { ApolloError } from '@apollo/client';
import NotificationStore from '../store/NotificationStore';

const handleError = (e: ApolloError, notification: NotificationStore) => {
  notification.setSnackBar({
    message: e.message,
    isAlert: true,
  });
};

export default handleError;
