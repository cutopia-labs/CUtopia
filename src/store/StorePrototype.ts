import { action } from 'mobx';
import { getStoreData, removeStoreItem, storeData } from '../helpers/store';

class StorePrototype {
  onLoadKeys?: string[];
  onResetKeys?: string[];
  defaultValues: Record<string, any>;
  storageConfig: Record<string, boolean>;

  constructor(
    onLoadKeys?: string[],
    onResetKeys?: string[],
    defaultValues?: Record<string, any>,
    storageConfig?: Record<string, any>
  ) {
    this.onLoadKeys = onLoadKeys;
    this.onResetKeys = onResetKeys;
    this.defaultValues = defaultValues || {};
    this.storageConfig = storageConfig || {};
  }

  @action.bound updateStore(
    key: string,
    value: any,
    skipCheck: boolean = false
  ) {
    if (skipCheck) {
      this[key] = value;
      return;
    }
    if (this[key] !== value) {
      this[key] = value;
    }
  }

  @action loadStore = () => {
    const defaultValues = { ...this.defaultValues };
    if (this.onLoadKeys) {
      this.onLoadKeys.forEach(key => {
        const retrieved = getStoreData(
          key,
          this.storageConfig[key] === undefined ? true : false
        );
        this.updateStore(
          key,
          retrieved === null ? this.defaultValues[key] : retrieved
        );
        delete defaultValues[key];
      });
    }
    /* If there are some unloaded keys in default values, load it */
    this.initStore(defaultValues);
  };

  @action setStore = (key: string, value: any) => {
    if (this[key] === value) return;
    this.updateStore(key, value, true);
    storeData(key, value, this.storageConfig[key] === undefined ? true : false);
  };

  @action resetStore = () => {
    const defaultValues = { ...this.defaultValues };
    if (this.onResetKeys) {
      this.onResetKeys.forEach(key => {
        removeStoreItem(key);
        this.updateStore(key, this.defaultValues[key] || null);
        delete defaultValues[key];
      });
    }
    this.initStore(defaultValues);
  };

  @action initStore = (defaultValues?: Record<string, any>) => {
    Object.entries(defaultValues || this.defaultValues).forEach(([k, v]) => {
      this.updateStore(k, v);
    });
  };
}

export default StorePrototype;
