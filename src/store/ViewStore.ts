import { ApolloError } from '@apollo/client';
import { makeObservable, observable, action } from 'mobx';
import { SNACKBAR_TIMEOUT } from '../constants/configs';
import handleError from '../helpers/handleError';
import { Dialog, SnackBar, SnackBarProps } from '../types';
import StorePrototype from './StorePrototype';

class ViewStore extends StorePrototype {
  @observable snackbar: SnackBar;
  @observable dialog: Dialog | null;

  @action init = () => {
    this.snackbar = {
      message: '',
      label: '',
      onClick: null,
      snackbarId: undefined,
    };
    this.dialog = null;
  };

  constructor() {
    super();
    makeObservable(this);
    this.init();
  }

  @action handleError = (e: ApolloError) => handleError(e, this);

  @action withErrorHandle(fn: (...args: any[]) => any) {
    return function (...args: any[]) {
      try {
        return fn(...args);
      } catch (e) {
        this.handleError(e);
      }
    };
  }

  @action safe = (e: ApolloError) => handleError(e, this);

  @action setSnackBar = async (prop: string | SnackBarProps) => {
    const snackbar = typeof prop === 'string' ? { message: prop } : prop;
    const snackbarId = snackbar?.message ? +new Date() : undefined;
    this.updateSnackBar(prop ? { ...snackbar, snackbarId } : null);
    await new Promise(resolve => setTimeout(resolve, SNACKBAR_TIMEOUT));
    if (this.needsClear(snackbarId)) {
      this.updateSnackBar({ message: '', snackbarId: undefined });
    }
  };

  @action warn = (message: string) => {
    this.setSnackBar({
      message,
      severity: 'warning',
    });
  };

  @action setDialog = (dialog: Dialog | null) => {
    this.updateStore('dialog', dialog);
  };

  @action needsClear = (snackbarId: number) => {
    return this.snackbar.snackbarId === snackbarId;
  };

  @action updateSnackBar = (snackbar: SnackBar | null) => {
    this.snackbar = snackbar;
  };
}

export default ViewStore;
