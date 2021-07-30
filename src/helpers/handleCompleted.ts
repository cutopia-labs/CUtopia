import NotificationStore from '../store/NotificationStore';

type HandleCompletedConfigs = {
  message?: string;
  notification?: NotificationStore;
};

const handleCompleted =
  (callback?: (data?: any) => any, options?: HandleCompletedConfigs) =>
  (data: any) => {
    callback(data);
    if (!options.notification) {
      return;
    }
    const msg = options.message || 'Success';
    options.notification.setSnackBar(msg);
  };

export default handleCompleted;
