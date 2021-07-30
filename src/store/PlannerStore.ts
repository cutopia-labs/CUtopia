import { makeObservable, observable, action, toJS } from 'mobx';

import { PlannerCourse, Planner, PlannerItem, CourseSection } from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { PLANNER_CONFIGS } from '../constants/configs';
import NotificationStore from './NotificationStore';
import StorePrototype from './StorePrototype';

const LOCAL_STORAGE_KEYS = ['planners', 'plannerTerm', 'currentPlanner'];

class PlannerStore extends StorePrototype {
  // Planner
  @observable planners: Record<string | number, Planner> = {};
  @observable plannerTerm: string;
  @observable previewPlannerCourse: PlannerCourse;
  @observable currentPlanner: number;
  @observable plannerCourses: PlannerCourse[] = [];
  @observable initiated: boolean = false; // prevent reaction of null timetable override planners

  notificationStore: NotificationStore;

  constructor(notificationStore: NotificationStore) {
    super();
    makeObservable(this);
    this.notificationStore = notificationStore;
  }

  @action async init() {
    await this.applyPlannerStore();
    if (!this.currentPlanner) {
      console.log('Creating new planners');
      const now = +new Date();
      this.setStore('currentPlanner', now);
      this.setStore('planners', {
        [now]: {
          key: now,
          courses: [],
        },
      });
    }
    this.plannerCourses = this.planners[this.currentPlanner]?.courses;
    this.initiated = true;
  }

  get plannerList() {
    return Object.values(this.planners).map((planner) => ({
      key: planner.key,
      label: planner.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
    })) as PlannerItem[];
  }

  // reset
  @action async reset() {
    this.init();
    // Clear user related asyncstorage
    await Promise.all(
      LOCAL_STORAGE_KEYS.map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }

  @action.bound findIndexInPlanner = (courseId) => {
    return this.plannerCourses.findIndex((item) => item.courseId === courseId);
  };

  @action.bound validKey = (key: number) =>
    Boolean(this.initiated && this.planners && key && key in this.planners);

  @action updateCurrentPlanner = (key: number) => {
    let label = PLANNER_CONFIGS.DEFAULT_TABLE_NAME;
    if (this.validKey(key)) {
      this.plannerCourses = this.planners[key].courses;
      this.currentPlanner = key;
      label = this.planners[key].label || label;
    } else {
      key = key || +new Date();
      this.planners[key] = {
        key,
        courses: [],
      };
      storeData('planners', this.planners);
      this.plannerCourses = [];
    }
    this.setStore('currentPlanner', key);
    this.notificationStore.setSnackBar(`Switched to ${label}`);
  };

  @action sectionInPlanner = (courseId, sectionId) => {
    const index = this.findIndexInPlanner(courseId);
    if (index === -1) {
      return false;
    } else {
      return sectionId in this.plannerCourses[index].sections;
    }
  };

  @action async applyPlannerStore() {
    await Promise.all(
      LOCAL_STORAGE_KEYS.map(async (key) => {
        const retrieved = await getStoreData(key);
        this.updateStore(key, retrieved);
      })
    );
    console.log(toJS(this));
  }

  @action async addPlannerCourses(plannerCourses: PlannerCourse[]) {
    this.addPlanner({
      key: +new Date(),
      courses: plannerCourses,
    });
  }

  @action async updatePlanners(key: number, plannerCourses: PlannerCourse[]) {
    if (this.validKey(key)) {
      this.planners[key].courses = plannerCourses;
      await storeData('planners', this.planners);
    }
  }

  @action async addPlanner(planner: Planner) {
    this.planners[planner.key] = planner;
    console.log(`Updated planner with ${toJS(this.planners)}`);
    await storeData('planners', this.planners);
  }

  @action async deletePlanner(key: number) {
    if (this.validKey(key)) {
      const UNDO_COPY = { ...this.planners };
      delete this.planners[key];
      this.updateCurrentPlanner(parseInt(Object.keys(this.planners)[0], 10));
      await this.notificationStore.setSnackBar({
        message: '1 item deleted',
        label: 'UNDO',
        onClick: () => {
          this.setStore('planners', UNDO_COPY);
        },
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('planners', this.planners);
    } else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action async clearPlannerCourses() {
    const UNDO_COPY = [...this.plannerCourses];
    this.plannerCourses = [];
    await this.notificationStore.setSnackBar({
      message: 'Cleared planner!',
      label: 'UNDO',
      onClick: () => {
        this.plannerCourses = UNDO_COPY;
      },
    });
    await storeData('plannerCourses', this.plannerCourses);
  }

  @action async updatePlannerCourse(course: PlannerCourse, index: number) {
    this.plannerCourses[index] = course;
  }

  @action async updatePlannerSection(
    section: CourseSection,
    index: number,
    sectionKey: string
  ) {
    this.plannerCourses[index] = {
      ...this.plannerCourses[index],
      sections: {
        ...this.plannerCourses[index].sections,
        [sectionKey]: section,
      },
    };
  }

  @action async removeHidedCourses() {
    const UNDO_COPY = JSON.stringify(this.plannerCourses);
    const UPDATE_COPY: PlannerCourse[] = JSON.parse(UNDO_COPY);
    UPDATE_COPY.forEach((course, courseIndex) => {
      Object.entries(course.sections).forEach(([k, v]) => {
        if (v.hide) {
          delete UPDATE_COPY[courseIndex].sections[k];
        }
      });
    });
    this.setStore('plannerCourses', UPDATE_COPY);
    await this.notificationStore.setSnackBar({
      message: 'Removed unchecked courses',
      label: 'UNDO',
      onClick: () => {
        this.setStore('plannerCourses', JSON.parse(UNDO_COPY));
      },
    });
  }

  @action async addToPlannerCourses(course: PlannerCourse) {
    const index = this.findIndexInPlanner(course.courseId);
    if (index !== -1) {
      this.plannerCourses[index] = {
        // not update sections directly to trigger update
        ...this.plannerCourses[index],
        sections: {
          ...this.plannerCourses[index].sections,
          ...course.sections,
        },
      };
      await storeData('plannerCourses', this.plannerCourses);
    } else {
      this.setStore('plannerCourses', [...this.plannerCourses, course]);
    }
  }

  @action async deleteSectionInPlannerCourses({ courseId, sectionId }) {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      const UNDO_COPY = JSON.stringify(this.plannerCourses);
      const sectionCopy = { ...this.plannerCourses[index].sections };
      delete sectionCopy[sectionId];
      if (sectionCopy) {
        this.plannerCourses[index] = {
          ...this.plannerCourses[index],
          sections: sectionCopy,
        };
      } else {
        this.plannerCourses.splice(index, 1);
      }
      await this.notificationStore.setSnackBar({
        message: '1 item deleted',
        label: 'UNDO',
        onClick: () => {
          this.setStore('plannerCourses', JSON.parse(UNDO_COPY));
        },
      });
      await storeData('plannerCourses', this.plannerCourses);
    } else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action async deleteInPlannerCourses(courseId) {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      const UNDO_COPY = [...this.plannerCourses];
      this.plannerCourses.splice(index, 1);
      await this.notificationStore.setSnackBar({
        message: '1 item deleted',
        label: 'UNDO',
        onClick: () => {
          this.updateStore('plannerCourses', UNDO_COPY);
        },
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('plannerCourses', this.plannerCourses);
    } else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action async setPlannerLabel(label: string) {
    this.planners[this.currentPlanner].label = label;
    await storeData('planners', this.planners);
  }
}

export default PlannerStore;
