import { makeObservable, observable, action } from 'mobx';

import { CourseQuery, CourseSearchList, LecturerQuery } from '../types';

import { DATA_VALID_BEFORE, SIMILAR_COURSE_LIMIT } from '../constants/configs';
import { storeData } from '../helpers/store';
import {
  _searchCourses,
  _getRandomGeCourses,
  _getSimilarCourses,
  _searchLecturers,
} from '../helpers/data';
import StorePrototype from './StorePrototype';

/* NOTE: planners are only temp, need remove after this sem Add drop */
const LOAD_KEYS = ['courseList', 'instructors'];

const RESET_KEYS = LOAD_KEYS;

const DEFAULT_VALUES = {};

class DataStore extends StorePrototype {
  @observable courseList: CourseSearchList;
  @observable instructors: string[];
  constructor() {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    makeObservable(this);
  }

  @action async getRemoteData(key) {
    if (this[key]) return this[key];
    const res = await fetch(`/resources/${key}.json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    this.saveData(data, key);
  }

  @action init = () => {
    console.log('Init data store');
    this.loadStore();
    this.verifyAndMount();
    /* Post-process to make course list in order */
  };

  @action verifyAndMount = () => {
    Object.entries(DATA_VALID_BEFORE).map(([key, expireBefore]) => {
      console.log(`key: ${key} ${this[key]} - ${expireBefore}`);
      /* If not expired */
      if (this[key]?.etag >= expireBefore && this[key]?.data) {
        this[key] = this[key].data;
      } else {
        console.log(`Expired: ${key} at ${this[key]?.etag}`);
      }
    });
  };

  @action saveData = (data: any, key: string) => {
    storeData(key, {
      data,
      etag: +new Date(),
    });
    this[key] = data;
  };

  /* Courses Data Related */

  @action searchCourses = async (query: CourseQuery) => {
    const courses = await this.getRemoteData('courseList');
    return _searchCourses(courses, query);
  };

  @action getSimilarCourses = async (
    courseId: string,
    limit: number = SIMILAR_COURSE_LIMIT
  ) => {
    const courses = await this.getRemoteData('courseList');
    return _getSimilarCourses(courses, courseId, limit);
  };

  @action getRandomGeCourses = async (limit: number = SIMILAR_COURSE_LIMIT) => {
    const courses = await this.getRemoteData('courseList');
    return _getRandomGeCourses(courses, limit);
  };

  /* Instructor Data Related */
  @action searchLecturers = async (query: LecturerQuery) => {
    const instructors = await this.getRemoteData('instructors');
    return _searchLecturers(instructors, query);
  };
}

export default DataStore;
