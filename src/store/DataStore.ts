import { makeObservable, observable, action } from 'mobx';

import {
  CourseQuery,
  CourseSearchItem,
  CourseSearchList,
  LecturerQuery,
} from '../types';

import { DATA_CONFIGS, SIMILAR_COURSE_LIMIT } from '../config';
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
    const fetchKey = DATA_CONFIGS[key].fetchKey || key;
    const res = await fetch(`/resources/${fetchKey}.json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    this.saveData(data, key);
    return this[key];
  }

  @action init = () => {
    this.loadStore();
    this.verifyAndMount();
    /* Post-process to make course list in order */
  };

  @action verifyAndMount = () => {
    Object.entries(DATA_CONFIGS).map(([key, config]) => {
      const { expire: expireBefore } = config;

      /* If not expired */
      if (this[key]?.etag >= expireBefore && this[key]?.data) {
        this[key] = this[key].data;
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
    const results: false | CourseSearchItem[] = _searchCourses(courses, query);
    if (results) {
      /* Make offered course come first */
      if (query.payload?.showAvalibility) {
        results.sort((a, b) => (a.o ? (b.o ? a.c.localeCompare(b.c) : -1) : 1));
      }
    }
    return results;
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
