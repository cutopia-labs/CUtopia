import {
  makeObservable, observable, action, reaction, remove,
} from 'mobx';

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

  // Planner
  @observable plannerTerm;

  @observable plannerCourses = []

  constructor(notificationStore) {
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
    await this.applyPlannerCourses();
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
    if (index !== -1) {
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
  @action async saveCutopiaAccount(username, sid, password, token) {
    username && await storeData('cutopiaUsername', username);
    sid && await storeData('userId', sid);
    password && await storeData('cutopiaPassword', password);
    await this.saveToken(token);
    this.notificationStore.setSnackBar('Successfully logged in !');
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
      token,
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
        }),
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
      ['cutopiaUsername', 'cutopiaPassword', 'userId', 'token', 'favoriteCourses', 'timetable', 'plannerCourses']
        .map(async key => {
          await removeStoreItem(key);
        }),
    );
  }

  /* Planner */

  @action async applyPlannerCourses() {
    const courses = JSON.parse(await getStoreData('plannerCourses'));
    console.table(courses);
    this.setPlannerCourses(courses || []);
    const term = await getStoreData('plannerTerm');
    this.updatePlannerTerm(term || null);
  }

  @action async savePlannerCourses(courses) {
    this.setPlannerCourses(courses);
    await storeData('plannerCourses', JSON.stringify(courses));
  }

  @action async clearPlannerCourses() {
    const UNDO_COPY = [...this.plannerCourses];
    this.plannerCourses = [];
    await this.notificationStore.setSnackBar('Cleared planner!', 'UNDO', () => {
      this.plannerCourses = UNDO_COPY;
    });
    await storeData('plannerCourses', JSON.stringify(this.plannerCourses));
  }

  @action async addToPlannerCourses(course) {
    const index = this.plannerCourses.findIndex(item => item.courseId === course.courseId);
    if (index !== -1) {
      this.plannerCourses[index] = { // not update sections directly to trigger update
        ...this.plannerCourses[index],
        sections: {
          ...this.plannerCourses[index].sections,
          ...course.sections,
        },
      };
      await storeData('plannerCourses', JSON.stringify(this.plannerCourses));
    }
    else {
      this.savePlannerCourses([...this.plannerCourses, course]);
    }
  }

  @action async deleteSectionInPlannerCourses({ courseId, sectionId }) {
    const index = this.plannerCourses.findIndex(course => course.courseId === courseId);
    if (index !== -1) {
      const UNDO_COPY = JSON.stringify(this.plannerCourses);
      const sectionCopy = { ...this.plannerCourses[index].sections };
      delete sectionCopy[sectionId];
      if (sectionCopy) {
        this.plannerCourses[index] = {
          ...this.plannerCourses[index],
          sections: sectionCopy,
        };
      }
      else {
        this.plannerCourses.splice(index, 1);
      }
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setPlannerCourses(JSON.parse(UNDO_COPY));
      });
      await storeData('plannerCourses', JSON.stringify(this.plannerCourses));
    }
    else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action async deleteInPlannerCourses(courseId) {
    const index = this.plannerCourses.findIndex(course => course.courseId === courseId);
    if (index !== -1) {
      const UNDO_COPY = [...this.plannerCourses];
      this.plannerCourses.splice(index, 1);
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setPlannerCourses(UNDO_COPY);
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('plannerCourses', JSON.stringify(this.plannerCourses));
    }
    else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action.bound setPlannerCourses(courses) {
    this.plannerCourses = courses;
  }

  @action async setAndSavePlannerCourses(courses) {
    this.setPlannerCourses(courses);
    await storeData('plannerCourses', JSON.stringify(this.plannerCourses));
  }

  @action async setPlannerTerm(term) {
    await storeData('plannerTerm', term);
    this.updatePlannerTerm(term);
  }

  @action.bound updatePlannerTerm(term) {
    this.plannerTerm = term;
  }
}

export default UserStore;
