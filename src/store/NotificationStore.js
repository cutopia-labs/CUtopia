import { makeObservable, observable, action } from 'mobx';

class NotificationStore {
  @observable snackbar;

  @action.bound init() {
    this.snackbar = {
      message: '',
      label: '',
      onPress: null,
      id: '',
    };
  }

  constructor() {
    makeObservable(this);
    this.init();
  }

  @action async setSnackBar(msg, label, onPress) {
    const id = msg ? +new Date() : undefined;
    this.updateSnackBar(msg, label, onPress, id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.needClear(id) && this.updateSnackBar(); // only clear if currect snackbar is itself
  }

  @action.bound needClear(id) {
    return this.snackbar.id === id;
  }

  @action.bound updateSnackBar(msg, label, onPress, id) {
    this.snackbar = {
      message: msg,
      label: label,
      onPress: onPress,
      id: id,
    };
  }
}

export default NotificationStore;
