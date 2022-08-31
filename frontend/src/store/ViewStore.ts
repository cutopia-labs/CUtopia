import { ApolloError } from '@apollo/client';
import { makeAutoObservable } from 'mobx';
import { SNACKBAR_TIMEOUT } from '../config';
import { wait } from '../helpers';
import { default as handleErrorFn } from '../helpers/handleError';
import { Dialog, SnackBar, SnackBarProps } from '../types';

class ViewStore {
  snackbar: SnackBar;
  dialog: Dialog | null;

  init() {
    this.snackbar = {
      message: '',
      label: '',
      onClick: null,
      snackbarId: undefined,
    };
    this.dialog = null;
  }

  constructor() {
    this.init();
    this.handleError = this.handleError.bind(this);
    makeAutoObservable(this);
  }

  handleError(e: ApolloError) {
    handleErrorFn(e, this);
  }

  withErrorHandle(fn: (...args: any[]) => any) {
    return function (...args: any[]) {
      try {
        return fn(...args);
      } catch (e) {
        this.handleError(e);
      }
    };
  }

  async setSnackBar(prop: string | SnackBarProps) {
    const snackbar = typeof prop === 'string' ? { message: prop } : prop;
    const snackbarId = snackbar?.message ? +new Date() : undefined;
    this.snackbar = prop ? { ...snackbar, snackbarId } : null;
    await wait(SNACKBAR_TIMEOUT);
    if (this.needsClear(snackbarId)) {
      this.snackbar = { message: '', snackbarId: undefined };
    }
  }

  warn(message: string) {
    this.setSnackBar({
      message,
      severity: 'warning',
    });
  }

  setDialog(dialog: Dialog | null) {
    this.dialog = dialog;
  }

  needsClear(snackbarId: number) {
    return this.snackbar.snackbarId === snackbarId;
  }
}

export default ViewStore;
