import { makeObservable, observable, action } from 'mobx';

import { CourseConcise, CourseTableEntry, LoginState, User } from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { TOKEN_EXPIRE_DAYS, VIEWS_LIMIT } from '../constants/states';
import NotificationStore from './NotificationStore';

class UserStore {
  // General State
  @observable viewCount: number;
  @observable loginState: LoginState;

  // User Saved Data
  @observable favoriteCourses: CourseConcise[] = [];
  @observable timetable: CourseTableEntry[];
  @observable user: Partial<User>;

  // CUtopia
  @observable cutopiaUsername: string;
  @observable cutopiaPassword: string;
  @observable token: string;

  notificationStore: NotificationStore;

  constructor(notificationStore: NotificationStore) {
    makeObservable(this);
    this.notificationStore = notificationStore;
  }

  @action async init() {
    this.loginState = LoginState.LOGGED_OUT;
    await this.applyViewCount();
    // User Saved Data
    await this.applyTimeTable();
    await this.applyFavoriteCourses();
    await this.applyUser();
    // CUtopia
    await this.applyCutopiaAccount();
  }

  @action.bound setUserStore(key: string, value: any) {
    this[key] = value;
  }

  // General

  get exceedLimit() {
    return this.viewCount > VIEWS_LIMIT;
  }

  @action async applyViewCount() {
    const count = await getStoreData('viewCount');
    this.setUserStore('viewCount', count || 0);
  }

  @action increaseViewCount = async () => {
    await this.increaseViewCountBounded();
  };

  @action.bound increaseViewCountBounded = async () => {
    const increased = this.viewCount + 1;
    await storeData('viewCount', increased);
    this.viewCount = increased;
  };

  // TimeTable
  @action async applyTimeTable() {
    const courses = await getStoreData('timetable');
    console.table(courses);
    this.setTimeTable(courses || []);
  }

  @action async saveTimeTable(courses) {
    this.setTimeTable(courses);
    await storeData('timetable', courses);
  }

  @action async clearTimeTable() {
    await removeStoreItem('timetable');
    this.setTimeTable([]);
  }

  @action async addToTimeTable(course) {
    this.saveTimeTable([...this.timetable, course]);
    this.notificationStore.setSnackBar(
      `Added ${course.courseId} to your timetable!`
    );
  }

  @action async deleteInTimeTable(courseId) {
    const index = this.timetable.findIndex(
      (course) => course.courseId === courseId
    );
    if (index !== -1) {
      const UNDO_COPY = [...this.timetable];
      this.timetable.splice(index, 1);
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setTimeTable(UNDO_COPY);
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('timetable', this.timetable);
    } else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action.bound setTimeTable(courses) {
    this.timetable = courses;
  }

  @action async setAndSaveTimeTable(courses) {
    this.setTimeTable(courses);
    await storeData('timetable', courses);
  }

  // User
  @action async applyUser() {
    const user = await getStoreData('user');
    this.setUser(user || {});
  }

  @action async saveUser(user) {
    this.setUser(user);
    await storeData('user', user);
  }

  @action async clearUser() {
    await removeStoreItem('user');
    this.setUser([]);
  }

  @action.bound setUser(user) {
    this.user = user;
  }

  // User Fav Courses
  @action async saveFavoriteCourses(courses: CourseConcise[]) {
    await storeData('favoriteCourses', courses);
    this.setFavoriteCourses(courses);
  }

  @action async applyFavoriteCourses() {
    const courses = await getStoreData('favoriteCourses');
    this.setFavoriteCourses(courses || []);
  }

  @action.bound setFavoriteCourses(courses: CourseConcise[]) {
    this.favoriteCourses = courses;
  }

  // CUtopia
  @action async saveCutopiaAccount(username, sid, password, token) {
    this.setUserStore('cutopiaUsername', username);
    this.setUserStore('cutopiaPassword', password);
    username && (await storeData('cutopiaUsername', username));
    password && (await storeData('cutopiaPassword', password));
    await this.saveToken(token);
    this.notificationStore.setSnackBar('Successfully logged in !');
  }

  @action async applyCutopiaAccount() {
    this.cutopiaUsername = (await getStoreData('cutopiaUsername')) || '';
    this.cutopiaPassword = (await getStoreData('cutopiaPassword')) || '';
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
      ['cutopiaUsername', 'cutopiaPassword', 'token'].map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }

  @action.bound setLogout() {
    this.loginState = LoginState.LOGGED_OUT;
    this.cutopiaPassword = null;
    this.cutopiaUsername = null;
    this.token = null;
  }

  // reset
  @action async reset() {
    this.init();
    // Clear user related asyncstorage
    await Promise.all(
      [
        'cutopiaUsername',
        'cutopiaPassword',
        'token',
        'favoriteCourses',
        'timetable',
      ].map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }
}

export default UserStore;
