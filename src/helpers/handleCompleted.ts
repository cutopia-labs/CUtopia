import { viewStore } from '../store';
import ViewStore from '../store/ViewStore';

type HandleCompletedConfigs = {
  message?: string;
  view?: ViewStore;
  mute?: boolean;
};

const handleCompleted =
  (callback?: (data?: any) => any, options?: HandleCompletedConfigs) =>
  (data: any) => {
    callback(data);
    if (options?.mute) return;
    const msg = options?.message || 'Success';
    (options?.view || viewStore).setSnackBar(msg);
  };

export default handleCompleted;
