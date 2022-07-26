import { makeObservable, observable, action } from 'mobx';

import { CourseSearchList } from '../types';

import { DATA_VALID_BEFORE } from '../constants/configs';
import StorePrototype from './StorePrototype';

/* NOTE: planners are only temp, need remove after this sem Add drop */
const LOAD_KEYS = ['shareMap', 'planners'];

const RESET_KEYS = LOAD_KEYS;

const DEFAULT_VALUES = {
  plannerName: '',
  planners: null,
  shareMap: {},
};

class DataStore extends StorePrototype {
  @observable courseList: CourseSearchList;
  @observable instructors: string[];
  constructor() {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    makeObservable(this);
  }

  @action init = () => {
    console.log('Init data store');
    this.loadStore();
    this.verifyAndMount();
    /* Post-process to make course list in order */
  };

  @action verifyAndMount = () => {
    Object.entries(DATA_VALID_BEFORE).map(([key, expireBefore]) => {
      /* If not expired */
      if (this[key].etag >= expireBefore && this[key]?.data) {
        this[key] = this[key].data;
      } else {
        console.log(`Expired: ${key} at ${this[key].etag}`);
      }
    });
  };
}

export default DataStore;
