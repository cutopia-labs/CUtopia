import { makeObservable, observable, action, runInAction } from 'mobx';
import {
  CourseQuery,
  CourseSearchItem,
  CourseSearchList,
  LecturerQuery,
} from '../types';
import {
  DATA_CONFIGS,
  SIMILAR_COURSE_LIMIT,
  CURRENT_TERM,
  plannerTerms,
} from '../config';
import { storeData } from '../helpers/store';
import {
  _searchCourses,
  _getRandomGeCourses,
  _getSimilarCourses,
  _searchLecturers,
} from '../helpers/data';
import { getCatalogManifest, getCatalogObject } from '../helpers/catalog';
import initialFaculties from '../constants/courseCodes';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = ['courseList', 'instructors'];

const RESET_KEYS = LOAD_KEYS;

const DEFAULT_VALUES = {};

class DataStore extends StorePrototype {
  @observable courseList: CourseSearchList;
  @observable instructors: string[];
  @observable currentTerm = CURRENT_TERM;
  @observable terms = plannerTerms;
  @observable faculties = initialFaculties;
  @observable catalogVersion = '';
  @observable catalogCheckedAt = 0;
  private resourceVersions: Record<string, string> = {};
  constructor() {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    makeObservable(this);
  }

  private async syncCatalog() {
    const manifest = await getCatalogManifest();
    if (!manifest) return null;
    const version = manifest.resources.courseList;
    const changed = version !== this.resourceVersions.courseList;
    const courses =
      changed || !this.courseList
        ? await getCatalogObject(version)
        : this.courseList;
    if (!courses || Array.isArray(courses))
      throw new Error('Invalid course index');
    // Availability flags and the semester they describe must change together.
    // A failed fetch leaves the last coherent catalog in place.
    runInAction(() => {
      if (changed || !this.courseList)
        this.saveData(courses, 'courseList', version);
      this.currentTerm = manifest.currentTerm;
      this.terms = manifest.availableTerms;
      this.catalogVersion = manifest.version;
      this.catalogCheckedAt = Date.parse(manifest.checkedAt);
    });
    return manifest;
  }

  @action async getRemoteData(key) {
    const manifest = await this.syncCatalog();
    if (manifest) {
      const version = manifest.resources[key];
      if (version && (this.resourceVersions[key] !== version || !this[key])) {
        try {
          const data = await getCatalogObject(version);
          if (key === 'courseList' && (!data || Array.isArray(data)))
            throw new Error('Invalid course index');
          if (key === 'instructors' && !Array.isArray(data))
            throw new Error('Invalid instructor index');
          this.saveData(data, key, version);
        } catch (error) {
          if (!this[key]) throw error;
        }
      }
    }
    if (this[key] && (key !== 'courseList' || this.resourceVersions[key]))
      return this[key];
    const fetchKey = DATA_CONFIGS[key].fetchKey || key;
    const res = await fetch(`/resources/${fetchKey}.json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    let data = await res.json();
    if (key === 'courseList') {
      // Build-time indexes have no semester/version contract. Retain browsing
      // metadata, but never advertise their old offerings as the current term.
      data = Object.fromEntries(
        Object.entries(data).map(([subject, rows]) => [
          subject,
          (rows as CourseSearchItem[]).map(({ o, ...course }) => course),
        ])
      );
    }
    this.saveData(data, key);
    return this[key];
  }

  @action init = () => {
    this.loadStore();
    this.verifyAndMount();
    const refresh = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const manifest = await this.syncCatalog();
        if (!manifest) return;
        this.faculties = await getCatalogObject(manifest.resources.faculties);
      } catch (_) {
        // Keep the last usable subject navigation during a transient failure.
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('catalog-updated', refresh);
    setInterval(refresh, 5 * 60000);
  };

  @action verifyAndMount = () => {
    Object.entries(DATA_CONFIGS).map(([key, config]) => {
      const { expire: expireBefore } = config;

      // If not expired
      if (this[key]?.etag >= expireBefore && this[key]?.data) {
        this.resourceVersions[key] = this[key].version;
        this[key] = this[key].data;
      } else {
        this[key] = null;
      }
    });
  };

  @action saveData = (data: any, key: string, version?: string) => {
    storeData(key, {
      data,
      etag: +new Date(),
      version,
    });
    this[key] = data;
    this.resourceVersions[key] = version;
  };

  // Courses Data Related

  @action searchCourses = async (query: CourseQuery) => {
    const courses = await this.getRemoteData('courseList');
    const results: false | CourseSearchItem[] = _searchCourses(courses, query);
    if (results) {
      // Make offered course come first
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

  // Instructor Data Related
  @action searchLecturers = async (query: LecturerQuery) => {
    const instructors = await this.getRemoteData('instructors');
    return _searchLecturers(instructors, query);
  };
}

export default DataStore;
