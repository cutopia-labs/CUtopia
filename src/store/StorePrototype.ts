import { action } from 'mobx';
import { getStoreData, removeStoreItem, storeData } from '../helpers/store';

class StorePrototype {
  onLoadKeys?: string[];
  onResetKeys?: string[];
  defaultValues: Record<string, any>;
  loadConfig: Record<string, boolean>;

  constructor(
    onLoadKeys?: string[],
    onResetKeys?: string[],
    defaultValues?: Record<string, any>,
    loadConfig?: Record<string, any>
  ) {
    this.onLoadKeys = onLoadKeys;
    this.onResetKeys = onResetKeys;
    this.defaultValues = defaultValues || {};
    this.loadConfig = loadConfig || {};
  }

  @action.bound updateStore(key: string, value: any) {
    this[key] = value;
  }

  @action loadStore = () => {
    const defaultValues = { ...this.defaultValues };
    if (this.onLoadKeys) {
      this.onLoadKeys.forEach(key => {
        const retrieved = getStoreData(
          key,
          this.loadConfig[key] === undefined ? true : false
        );
        this.updateStore(
          key,
          retrieved === null ? this.defaultValues[key] : retrieved
        );
        delete defaultValues[key];
      });
    }
    this.initStore(defaultValues);
  };

  @action setStore = (key: string, value: any) => {
    this.updateStore(key, value);
    storeData(key, value, this.loadConfig[key] === undefined ? true : false);
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
