import { makeObservable, observable, action, reaction, remove } from 'mobx';

import errorStore, { ERROR_CODES } from './ErrorStore';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { LOGIN_STATES } from '../constants/states';

const TOKEN_EXPIRE_DAYS = 7;

class UserStore {
  // General State
  @observable loginState

  // User Saved Data
  @observable favoriteCourses = []
  @observable timetable

  // CUtopia
  @observable userId
  @observable cutopiaUsername
  @observable cutopiaPassword
  @observable token

  constructor(notificationStore) {
    this.init();
    makeObservable(this);
    this.observeLoadingError();
    this.notificationStore = notificationStore;
  }

  observeLoadingError() {
    reaction(
      () => errorStore.loginError,
      loginError => {
        // TODO: re-login if loginError is session timeout
      },
    );
  }

  @action.bound async init() {
    this.loginState = LOGIN_STATES.LOGGED_OUT;
    // User Saved Data
    await this.applyTimeTable();
    await this.applyFavoriteCourses();
    // CUtopia
    await this.applyCutopiaAccount();
  }

  // TimeTable
  @action async applyTimeTable() {
    const courses = JSON.parse(await getStoreData('timetable'));
    console.table(courses);
    this.setTimeTable(courses || []);
  }

  @action async saveTimeTable(courses) {
    this.setTimeTable(courses);
    await storeData('timetable', JSON.stringify(courses));
  }

  @action async clearTimeTable() {
    await removeStoreItem('timetable');
    this.setTimeTable([]);
  }

  @action async addToTimeTable(course) {
    this.saveTimeTable([...this.timetable, course]);
    this.notificationStore.setSnackBar(`Added ${course.courseId} to your timetable!`);
  }

  @action async deleteInTimeTable(courseId) {
    const index = this.timetable.findIndex(course => course.courseId === courseId);
    if (index !== -1){
      const UNDO_COPY = [...this.timetable];
      this.timetable.splice(index, 1);
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setTimeTable(UNDO_COPY);
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('timetable', JSON.stringify(this.timetable));
    }
    else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action.bound setTimeTable(courses) {
    this.timetable = courses;
  }

  // User Fav Courses

  @action async saveFavoriteCourses(courses) {
    await storeData('favoriteCourses', JSON.stringify(courses));
    this.setFavoriteCourses(courses);
  }

  @action async applyFavoriteCourses() {
    const courses = JSON.parse(await getStoreData('favoriteCourses'));
    this.setFavoriteCourses(courses || []);
  }

  @action.bound setFavoriteCourses(courses) {
    this.favoriteCourses = courses;
  }

  // CUtopia
  @action async saveCutopiaAccount({ username, sid, password, token }) {
    username && await storeData('cutopiaUsername', username);
    sid && await storeData('userId', sid);
    password && await storeData('cutopiaPassword', password);
    await this.setCutopiaAccount({ username, sid, password, token });
  }

  @action async setCutopiaAccount({ username, sid, password, token }) {
    this.cutopiaUsername = username || '';
    this.userId = sid || '';
    this.cutopiaPassword = password || '';
    await this.saveToken(token);
  }

  @action async applyCutopiaAccount() {
    this.cutopiaUsername = (await getStoreData('cutopiaUsername')) || '';
    this.cutopiaPassword = (await getStoreData('cutopiaPassword')) || '';
    this.userId = (await getStoreData('userId')) || '';
    const savedToken = JSON.parse((await getStoreData('token'))) || {};
    console.log('Loaded Saved Token');
    console.log(savedToken);
    console.log(`Token expired: ${new Date(savedToken).valueOf() > new Date().valueOf()}`);
    if (savedToken.token && !(new Date(savedToken).valueOf() > new Date().valueOf())) {
      this.setToken(savedToken.token);
    }
  }

  @action async saveToken(token) {
    const savedToken = {
      token: token,
      expire: new Date().setDate(new Date().getDate() + TOKEN_EXPIRE_DAYS),
    };
    await storeData('token', JSON.stringify(savedToken));
    this.setToken(token);
  }

  @action setToken(token) {
    this.token = token;
    this.loginState = LOGIN_STATES.LOGGED_IN_CUTOPIA;
  }

  @action async logout() {
    this.setLogout();
    await Promise.all(
      ['cutopiaUsername', 'cutopiaPassword', 'userId', 'token']
        .map(async key => {
          await removeStoreItem(key);
        })
    );
  }

  @action.bound setLogout() {
    this.loginState = LOGIN_STATES.LOGGED_OUT;
    this.userId = null;
    this.cutopiaPassword = null;
    this.cutopiaUsername = null;
    this.token = null;
  }

  // reset
  @action async reset() {
    this.init();
    // Clear user related asyncstorage
    await Promise.all(
      ['cutopiaUsername', 'cutopiaPassword', 'userId', 'token', 'favoriteCourses', 'timetable']
        .map(async key => {
          await removeStoreItem(key);
        })
    );
  }
}

export default UserStore;
