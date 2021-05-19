import { makeObservable, observable, action } from 'mobx';

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
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.needClear(id) && this.updateSnackBar(); // only clear if currect snackbar is itself
  }

  @action.bound needClear(id) {
    return this.snackbar.id === id;
  }

  @action.bound updateSnackBar(msg, label, onClick, id) {
    this.snackbar = {
      message: msg,
      label: label,
      onClick: onClick,
      id: id,
    };
  }
}

export default NotificationStore;
