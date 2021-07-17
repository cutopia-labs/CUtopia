import { makeObservable, observable, action } from 'mobx';

export const ERROR_CODES = Object.freeze({
  CUSIS: {
    DOWN: 'CUSIS is down',
  },
  NETWORK: {
    UNAVAILABLE: 'Network is unavailable',
  },
  LOGIN: {
    INVALID_DATA: 'Incorrect user ID or password',
  },
  PARSER: {
    UNKNOWN: 'Unable to parse data from CUSIS response',
  },
});

class ErrorStore {
  @observable loginError: string;
  static loginError: string;

  constructor() {
    makeObservable(this);
  }

  @action setLoginError(error: string) {
    this.loginError = error;
  }
}

export default ErrorStore;
