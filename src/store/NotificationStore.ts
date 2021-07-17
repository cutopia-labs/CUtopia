import { makeObservable, observable, action } from 'mobx';
import { SNACKBAR_TIMEOUT } from '../constants/configs';
import { SnackBar } from '../types';

class NotificationStore {
  @observable snackbar: SnackBar;

  @action.bound init() {
    this.snackbar = {
      message: '',
      label: '',
      onClick: null,
      id: undefined,
    };
  }

  constructor() {
    makeObservable(this);
    this.init();
  }

  @action async setSnackBar(
    message: string,
    label?: string,
    onClick?: (...args: any[]) => any
  ) {
    const id = message ? +new Date() : undefined;
    this.updateSnackBar({ message, label, onClick, id });
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
    onClick,
    id,
  }: SnackBar | null) {
    this.snackbar = {
      message: message,
      label,
      onClick,
      id,
    };
  }
}

export default NotificationStore;
