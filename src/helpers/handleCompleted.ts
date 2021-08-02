import ViewStore from '../store/ViewStore';

type HandleCompletedConfigs = {
  message?: string;
  view?: ViewStore;
};

const handleCompleted =
  (callback?: (data?: any) => any, options?: HandleCompletedConfigs) =>
  (data: any) => {
    callback(data);
    if (!options.view) {
      return;
    }
    const msg = options.message || 'Success';
    options.view.setSnackBar(msg);
  };

export default handleCompleted;
