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
      onClick: null,
      snackbarId: undefined,
    };
  }

  constructor() {
    makeObservable(this);
    this.init();
  }

  @action handleError = (e) => handleError(e, this);

  @action async setSnackBar(prop: string | SnackBarProps) {
    const snackbar = typeof prop === 'string' ? { message: prop } : prop;
    const snackbarId = snackbar?.message ? +new Date() : undefined;
    this.updateSnackBar(prop ? { ...snackbar, snackbarId } : null);
    await new Promise((resolve) => setTimeout(resolve, SNACKBAR_TIMEOUT));
    if (this.needsClear(snackbarId)) {
      this.updateSnackBar({ message: '', snackbarId: undefined });
    }
  }

  @action.bound needsClear(snackbarId: number) {
    return this.snackbar.snackbarId === snackbarId;
  }

  @action.bound updateSnackBar(snackbar: SnackBar | null) {
    this.snackbar = snackbar;
  }
}

export default NotificationStore;
