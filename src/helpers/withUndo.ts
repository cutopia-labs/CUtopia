import NotificationStore from '../store/NotificationStore';

type UndoConfigs = {
  prevData: any;
  setData: (prevData: any) => void;
  notificationStore: NotificationStore;
  stringify?: boolean;
  message?: string;
};

const withUndo = async (
  { prevData, setData, notificationStore, stringify, message }: UndoConfigs,
  fn?: (...args: any[]) => void
) => {
  prevData = stringify ? JSON.stringify(prevData) : prevData;
  fn && fn();
  await notificationStore.setSnackBar({
    message: message || 'Success',
    label: 'UNDO',
    onClick: () => {
      setData(stringify ? JSON.parse(prevData) : prevData);
    },
  });
};

export default withUndo;
