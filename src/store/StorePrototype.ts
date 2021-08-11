import { action } from 'mobx';

import { storeData } from '../helpers/store';

class StorePrototype {
  @action.bound updateStore(key: string, value: any) {
    this[key] = value;
    console.log(`Updated ${key} with value ${JSON.stringify(value)}`);
  }

  @action setStore = async (key: string, value: any) => {
    this.updateStore(key, value);
    storeData(key, value);
  };
}

export default StorePrototype;
