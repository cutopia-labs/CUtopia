import { action } from 'mobx';

import { storeData } from '../helpers/store';

class StorePrototype {
  @action updateStore = (key, value) => {
    this[key] = value;
  };
  @action setStore = (key, value) => {
    this.updateStore(key, value);
    storeData(key, value);
  };
}

export default StorePrototype;
