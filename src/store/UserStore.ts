import { makeObservable, observable, action } from 'mobx';

import {
  CourseConcise,
  CourseInfo,
  CourseTableEntry,
  LoginState,
  User,
} from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { TOKEN_EXPIRE_DAYS, VIEWS_LIMIT } from '../constants';
import { FULL_MEMBER_LEVEL, HISTORY_MAX_LENGTH } from '../constants/configs';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = [
  'username',
  'favoriteCourses',
  'timetable',
  'viewCount',
  'searchHistory',
];

const RESET_KEYS = [...LOAD_KEYS, 'token'];

const LOGOUT_KEYS = ['username', 'token'];

class UserStore extends StorePrototype {
  // General State
  @observable viewCount: number;
  @observable loginState: LoginState;

  // User Saved Data
  @observable searchHistory: string[] = [];
  @observable favoriteCourses: CourseConcise[] = [];
  @observable timetable: CourseTableEntry[];

  // User Session Data (Reload everytime init)
  @observable data: User;

  // CUtopia
  @observable username: string;
  @observable token: string;

  viewStore: ViewStore;

  constructor(viewStore: ViewStore) {
    super();
    this.viewStore = viewStore;
    makeObservable(this);
  }

  @action async init() {
    this.loginState = LoginState.INIT;
    await this.applyUserStore();
    await this.applyToken();
    if (this.loginState === LoginState.INIT) {
      console.log('No token found');
      this.loginState = LoginState.LOGGED_OUT;
    }
    console.table(this.timetable);
    this.favoriteCourses = this.favoriteCourses || [];
    this.searchHistory = this.searchHistory || [];
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
    await this.saveToken(token);
    this.viewStore.setSnackBar(`Logged in as ${username}`);
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
    storeData('token', savedToken);
    this.setToken(token);
  }

  @action.bound setToken(token) {
    this.token = token;
    this.loginState = LoginState.LOGGED_IN;
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

  // Fav courses

  @action checkIsFavourite = (courseId) =>
    this.favoriteCourses.some((course) => course.courseId === courseId);

  @action toggleFavourite = async (
    courseInfo: CourseInfo,
    isFavourite?: boolean
  ) => {
    if (isFavourite || this.checkIsFavourite(courseInfo.courseId)) {
      this.setStore(
        'favoriteCourses',
        [...this.favoriteCourses].filter(
          (course) => course.courseId !== courseInfo.courseId
        )
      );
    } else {
      await this.setStore(
        'favoriteCourses',
        this.favoriteCourses.concat({
          courseId: courseInfo.courseId,
          title: courseInfo.title,
        })
      );
    }
  };

  // Search History

  @action saveHistory = async (courseId: string) => {
    let temp = [...this.searchHistory];
    if (temp.length >= HISTORY_MAX_LENGTH) {
      temp.pop();
    }
    temp = [courseId].concat(temp.filter((saved) => saved !== courseId));
    this.setStore('searchHistory', temp);
  };

  @action deleteHistory = async (courseId) => {
    const temp = this.searchHistory.filter((hist) => hist !== courseId);
    this.setStore('searchHistory', temp);
  };

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
