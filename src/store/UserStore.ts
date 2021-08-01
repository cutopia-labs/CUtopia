import { makeObservable, observable, action } from 'mobx';

import { CourseConcise, CourseTableEntry, LoginState, User } from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { TOKEN_EXPIRE_DAYS, VIEWS_LIMIT } from '../constants/states';
import { FULL_MEMBER_LEVEL } from '../constants/configs';
import NotificationStore from './NotificationStore';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = ['username', 'favoriteCourses', 'timetable', 'viewCount'];

const RESET_KEYS = [...LOAD_KEYS, 'token'];

const LOGOUT_KEYS = ['username', 'token'];

class UserStore extends StorePrototype {
  // General State
  @observable viewCount: number;
  @observable loginState: LoginState;

  // User Saved Data
  @observable favoriteCourses: CourseConcise[] = [];
  @observable timetable: CourseTableEntry[];

  // User Session Data (Reload everytime init)
  @observable data: User;

  // CUtopia
  @observable username: string;
  @observable token: string;

  notificationStore: NotificationStore;

  constructor(notificationStore: NotificationStore) {
    super();
    this.notificationStore = notificationStore;
    makeObservable(this);
  }

  @action async init() {
    this.loginState = LoginState.LOGGED_OUT;
    await this.applyUserStore();
    await this.applyToken();
    console.table(this.timetable);
    this.favoriteCourses = this.favoriteCourses || [];
    this.viewCount = this.viewCount || 0;
  }

  @action async applyUserStore() {
    await Promise.all(
      LOAD_KEYS.map(async (key) => {
        const retrieved = await getStoreData(key);
        this.updateStore(key, retrieved);
      })
    );
  }

  // General

  get exceedLimit() {
    return this.viewCount > VIEWS_LIMIT;
  }

  get isFullMember() {
    return this.data?.level >= FULL_MEMBER_LEVEL;
  }

  @action increaseViewCount = async () => {
    await this.increaseViewCountBounded();
  };

  @action.bound increaseViewCountBounded = async () => {
    const increased = this.viewCount + 1;
    this.setStore('viewCount', increased);
  };

  // CUtopia
  @action async saveUser(username, token) {
    this.setStore('username', username);
    await this.saveToken(token);
    console.log(token);
    this.notificationStore.setSnackBar(`Logged in as ${username}`);
  }

  @action async applyToken() {
    const savedToken = (await getStoreData('token')) || {};
    console.log('Loaded Saved Token');
    console.log(savedToken);
    console.log(
      `Token expired: ${new Date(savedToken).valueOf() > new Date().valueOf()}`
    );
    if (
      savedToken.token &&
      !(new Date(savedToken).valueOf() > new Date().valueOf())
    ) {
      this.setToken(savedToken.token);
    }
  }

  @action async saveToken(token) {
    const savedToken = {
      token,
      expire: new Date().setDate(new Date().getDate() + TOKEN_EXPIRE_DAYS),
    };
    await storeData('token', savedToken);
    this.setToken(token);
  }

  @action.bound setToken(token) {
    this.token = token;
    this.loginState = LoginState.LOGGED_IN_CUTOPIA;
  }

  @action async logout() {
    this.setLogout();
    await Promise.all(
      LOGOUT_KEYS.map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }

  @action.bound setLogout() {
    this.loginState = LoginState.LOGGED_OUT;
    this.username = null;
    this.token = null;
  }

  // reset
  @action async reset() {
    this.init();
    // Clear user related asyncstorage
    await Promise.all(
      RESET_KEYS.map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }
}

export default UserStore;
