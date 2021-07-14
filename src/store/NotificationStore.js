import { makeObservable, observable, action } from 'mobx';
import { SNACKBAR_TIMEOUT } from '../constants/configs';

class NotificationStore {
  @observable snackbar;

  @action.bound init() {
    this.snackbar = {
      message: '',
      label: '',
      onClick: null,
      id: '',
    };
  }

  constructor() {
    makeObservable(this);
    this.init();
  }

  @action async setSnackBar(msg, label, onClick) {
    const id = msg ? +new Date() : undefined;
    this.updateSnackBar(msg, label, onClick, id);
    await new Promise((resolve) => setTimeout(resolve, SNACKBAR_TIMEOUT));
    if (this.needsClear(id)) {
      this.updateSnackBar();
    }
  }

  @action.bound needsClear(id) {
    return this.snackbar.id === id;
  }

  @action.bound updateSnackBar(msg, label, onClick, id) {
    this.snackbar = {
      message: msg,
      label,
      onClick,
      id,
    };
  }
}

export default NotificationStore;
