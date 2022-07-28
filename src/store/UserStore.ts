import { makeObservable, observable, action } from 'mobx';

import {
  CourseConcise,
  CourseInfo,
  AuthState,
  RatingField,
  Review,
  User,
} from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import {
  HISTORY_MAX_LENGTH,
  LEVEL_UP_EXP,
  TOKEN_EXPIRE_BEFORE,
} from '../constants/configs';
import withUndo from '../helpers/withUndo';
import { getTokenExpireDate } from '../helpers';
import { CREATE_PLANNER_FLAG, TOKEN_EXPIRE_DAYS } from '../constants';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';
import PlannerStore from './PlannerStore';

const LOAD_KEYS = [
  'favoriteCourses',
  'searchHistory',
  'reviewDrafts',
  'recentReviewCategory',
];

const RESET_KEYS = [...LOAD_KEYS, 'token'];

const DEFAULT_VALUES = {
  reviewDrafts: {},
  searchHistory: [],
  favoriteCourses: [],
  loginState: AuthState.INIT,
  recentReviewCategory: 'grading',
};

const LOGOUT_KEYS = ['username', 'token'];

class UserStore extends StorePrototype {
  // General State
  @observable loginState: AuthState;

  // User Saved Data
  @observable reviewDrafts: Record<string, Review> = {};
  @observable searchHistory: string[] = [];
  @observable favoriteCourses: CourseConcise[] = [];
  @observable recentReviewCategory: RatingField;

  // User Session Data (Reload everytime init)
  @observable data: User;

  // CUtopia
  @observable username: string;
  @observable token: string;

  viewStore: ViewStore;
  plannerStore: PlannerStore;

  constructor(viewStore: ViewStore, plannerStore: PlannerStore) {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    this.viewStore = viewStore;
    this.plannerStore = plannerStore;
    makeObservable(this);
  }

  @action init() {
    console.log('Init user store');
    this.loadStore();
    this.applyToken();
    if (this.loginState === AuthState.INIT) {
      this.loginState = AuthState.LOGGED_OUT;
    }
  }

  // General

  get level() {
    return Math.floor((this.data?.exp || 0) / LEVEL_UP_EXP);
  }

  get loggedIn() {
    return Boolean(this.data?.username);
  }

  // CUtopia
  @action saveUser = (username: string, token: string, data: Partial<User>) => {
    // need set date before set token cuz set token first will trigger query user.me
    this.updateUserData(data);
    this.saveToken(token);
    this.viewStore.setSnackBar(`Logged in as ${username}`);
  };

  @action updateUserData = (data: Partial<User>) => {
    if (data?.username) {
      console.log(data);
      this.updateStore('data', data);
      console.log(`Update plannerId to ${data.timetableId}`);
      this.plannerStore.updateStore(
        'plannerId',
        data.timetableId || CREATE_PLANNER_FLAG
      );
    }
  };

  @action applyToken = () => {
    const savedToken = getStoreData('token') || {};
    if (!savedToken.token) {
      return;
    }
    console.log(
      `Apply token ${savedToken.token}\n${getTokenExpireDate(
        TOKEN_EXPIRE_BEFORE,
        TOKEN_EXPIRE_DAYS
      )}`
    );
    if (
      savedToken.expire <
      getTokenExpireDate(TOKEN_EXPIRE_BEFORE, TOKEN_EXPIRE_DAYS)
    ) {
      removeStoreItem('token');
    } else {
      this.setToken(savedToken.token);
    }
  };

  @action saveToken = (token: string) => {
    const savedToken = {
      token,
      expire: getTokenExpireDate(+new Date()),
    };
    storeData('token', savedToken);
    this.setToken(token);
  };

  @action setToken = (token: string) => {
    this.token = token;
    this.loginState = AuthState.LOGGED_IN;
  };

  @action logout = () => {
    this.setLogout();
    LOGOUT_KEYS.forEach(key => {
      removeStoreItem(key);
      this[key] = undefined;
    });
  };

  @action setLogout = () => {
    this.loginState = AuthState.LOGGED_OUT;
    this.token = null;
  };

  // Fav courses

  @action checkIsFavourite = (courseId: string) =>
    this.favoriteCourses.some(course => course.courseId === courseId);

  @action toggleFavourite = (courseInfo: CourseInfo, isFavourite?: boolean) => {
    if (isFavourite || this.checkIsFavourite(courseInfo.courseId)) {
      this.setStore(
        'favoriteCourses',
        [...this.favoriteCourses].filter(
          course => course.courseId !== courseInfo.courseId
        )
      );
    } else {
      this.setStore(
        'favoriteCourses',
        this.favoriteCourses.concat({
          courseId: courseInfo.courseId,
          title: courseInfo.title,
        })
      );
    }
  };

  // Search History
  @action saveHistory = (courseId: string) => {
    let temp = [...this.searchHistory];
    if (temp.length >= HISTORY_MAX_LENGTH) {
      temp.pop();
    }
    temp = [courseId].concat(temp.filter(saved => saved !== courseId));
    this.setStore('searchHistory', temp);
  };

  @action deleteHistory = (courseId: string) => {
    const temp = this.searchHistory.filter(hist => hist !== courseId);
    this.setStore('searchHistory', temp);
  };

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
  @action reset = () => {
    this.resetStore();
  };
}

export default UserStore;
