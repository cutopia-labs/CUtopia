import { makeObservable, observable, action } from 'mobx';

const SNACKBAR_TIMEOUT = 3000;

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
    await new Promise(resolve => setTimeout(resolve, SNACKBAR_TIMEOUT));
    this.needClear(id) && this.updateSnackBar(); // only clear if currect snackbar is itself
  }

  @action.bound needClear(id) {
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
