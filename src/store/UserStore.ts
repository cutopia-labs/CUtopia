import { makeObservable, observable, action } from 'mobx';

import {
  CourseConcise,
  CourseInfo,
  CourseTableEntry,
  DiscussionRecent,
  LoginState,
  Review,
  User,
} from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { TOKEN_EXPIRE_DAYS } from '../constants';
import { HISTORY_MAX_LENGTH, LEVEL_UP_EXP } from '../constants/configs';
import withUndo from '../helpers/withUndo';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = [
  'username',
  'favoriteCourses',
  'timetable',
  'searchHistory',
  'discussionHistory',
  'reviewDrafts',
];

const RESET_KEYS = [...LOAD_KEYS, 'token'];

const DEFAULT_VALUES = {
  reviewDrafts: {},
  discussionHistory: [],
  searchHistory: [],
  favoriteCourses: [],
  loginState: LoginState.INIT,
};

const LOGOUT_KEYS = ['username', 'token'];

class UserStore extends StorePrototype {
  // General State
  @observable loginState: LoginState;

  // User Saved Data
  @observable reviewDrafts: Record<string, Review> = {};
  @observable discussionHistory: DiscussionRecent[] = [];
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
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    this.viewStore = viewStore;
    makeObservable(this);
  }

  @action async init() {
    this.initStore();
    await this.applyToken();
    if (this.loginState === LoginState.INIT) {
      this.loginState = LoginState.LOGGED_OUT;
    }
  }

  // General

  get level() {
    return Math.floor((this.data?.exp || 0) / LEVEL_UP_EXP);
  }

  // CUtopia
  @action async saveUser(username: string, token: string, data: Partial<User>) {
    // need set date before set token cuz set token first will trigger query user.me
    this.updateUserData(data);
    await this.saveToken(token);
    this.viewStore.setSnackBar(`Logged in as ${username}`);
  }

  @action updateUserData(data: Partial<User>) {
    if (data?.username) {
      console.log(data);
      this.updateStore('data', data);
    }
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
      LOGOUT_KEYS.map(async key => {
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

  @action checkIsFavourite = courseId =>
    this.favoriteCourses.some(course => course.courseId === courseId);

  @action async toggleFavourite(courseInfo: CourseInfo, isFavourite?: boolean) {
    if (isFavourite || this.checkIsFavourite(courseInfo.courseId)) {
      this.setStore(
        'favoriteCourses',
        [...this.favoriteCourses].filter(
          course => course.courseId !== courseInfo.courseId
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
  }

  // Search History
  @action async saveHistory(courseId: string) {
    let temp = [...this.searchHistory];
    if (temp.length >= HISTORY_MAX_LENGTH) {
      temp.pop();
    }
    temp = [courseId].concat(temp.filter(saved => saved !== courseId));
    this.setStore('searchHistory', temp);
  }

  @action async deleteHistory(courseId) {
    const temp = this.searchHistory.filter(hist => hist !== courseId);
    this.setStore('searchHistory', temp);
  }

  @action async appendDiscussionHistory(item: DiscussionRecent) {
    const index = this.discussionHistory.findIndex(
      hist => hist.courseId === item.courseId
    );
    let temp = [...this.discussionHistory];
    if (index === -1) {
      if (temp.length >= HISTORY_MAX_LENGTH) {
        temp.pop();
      }
    } else {
      temp.splice(index, 1);
    }
    this.setStore('discussionHistory', [item, ...temp]);
  }

  @action updateReviewDrafts = (courseId: string, review: Review) => {
    withUndo(
      {
        prevData: { ...this.reviewDrafts },
        setData: prevData => this.setStore('reviewDrafts', prevData),
        message: 'Draft saved!',
        viewStore: this.viewStore,
      },
      () => {
        const copy = { ...this.reviewDrafts };
        copy[courseId] = review;
        this.setStore('reviewDrafts', copy);
      }
    );
  };

  @action deleteReveiwDraft = (courseId: string) => {
    const copy = { ...this.reviewDrafts };
    delete copy[courseId];
    this.setStore('reviewDrafts', copy);
  };

  // reset
  @action async reset() {
    this.resetStore();
  }
}

export default UserStore;
