import { makeObservable, observable, action } from 'mobx';
import { SNACKBAR_TIMEOUT } from '../constants/configs';
import handleError from '../helpers/handleError';
import { SnackBar, SnackBarProps } from '../types';

class NotificationStore {
  @observable snackbar: SnackBar;

  @action.bound init() {
    this.snackbar = {
      message: '',
      label: '',
      isAlert: false,
      onClick: null,
      id: undefined,
    };
  }

  constructor() {
    makeObservable(this);
    this.init();
  }

  @action handleError = (e) => handleError(e, this);

  @action async setSnackBar(prop: string | SnackBarProps) {
    const snackbar = typeof prop === 'string' ? { message: prop } : prop;
    const id = snackbar?.message ? +new Date() : undefined;
    this.updateSnackBar(prop ? { ...snackbar, id } : null);
    await new Promise((resolve) => setTimeout(resolve, SNACKBAR_TIMEOUT));
    if (this.needsClear(id)) {
      this.updateSnackBar({ message: '', id: undefined });
    }
  }

  @action.bound needsClear(id: number) {
    return this.snackbar.id === id;
  }

  @action.bound updateSnackBar({
    message,
    label,
    isAlert,
    onClick,
    id,
  }: SnackBar | null) {
    this.snackbar = {
      message: message,
      label,
      onClick,
      id,
      isAlert,
    };
  }
}

export default NotificationStore;
