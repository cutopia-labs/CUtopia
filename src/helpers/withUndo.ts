import ViewStore from '../store/ViewStore';

type UndoConfigs = {
  prevData: any;
  setData: (prevData: any) => void;
  viewStore: ViewStore;
  stringify?: boolean;
  message?: string;
};

const withUndo = async (
  { prevData, setData, viewStore, stringify, message }: UndoConfigs,
  fn?: (...args: any[]) => void
) => {
  prevData = stringify ? JSON.stringify(prevData) : prevData;
  fn && fn();
  await viewStore.setSnackBar({
    message: message || 'Success',
    label: 'UNDO',
    onClick: () => {
      setData(stringify ? JSON.parse(prevData) : prevData);
    },
  });
};

export default withUndo;
