import { makeObservable, observable, action } from 'mobx';

import { PlannerCourse } from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import NotificationStore from './NotificationStore';

class PlannerStore {
  // Planner
  @observable plannerTerm: string;
  @observable plannerCourses: PlannerCourse[] = []; // To Add Type
  @observable previewPlannerCourse: PlannerCourse;

  notificationStore: NotificationStore;

  constructor(notificationStore: NotificationStore) {
    makeObservable(this);
    this.notificationStore = notificationStore;
  }

  @action async init() {
    await this.applyPlannerCourses();
  }

  @action.bound setPlannerStore(key: string, value: any) {
    this[key] = value;
  }

  // reset
  @action async reset() {
    this.init();
    // Clear user related asyncstorage
    await Promise.all(
      ['plannerCourses'].map(async (key) => {
        await removeStoreItem(key);
      })
    );
  }

  /* Planner */
  @action.bound findIndexInPlanner = (courseId) => {
    return this.plannerCourses.findIndex((item) => item.courseId === courseId);
  };

  @action sectionInPlanner = (courseId, sectionId) => {
    const index = this.findIndexInPlanner(courseId);
    if (index === -1) {
      return false;
    } else {
      return sectionId in this.plannerCourses[index].sections;
    }
  };

  @action async applyPlannerCourses() {
    const courses = await getStoreData('plannerCourses');
    console.table(courses);
    this.setPlannerStore('plannerCourses', courses || []);
    const term = await getStoreData('plannerTerm');
    this.setPlannerStore('plannerTerm', term || null);
  }

  @action async savePlannerCourses(courses) {
    this.setPlannerStore('plannerCourses', courses);
    await storeData('plannerCourses', courses);
  }

  @action async clearPlannerCourses() {
    const UNDO_COPY = [...this.plannerCourses];
    this.plannerCourses = [];
    await this.notificationStore.setSnackBar('Cleared planner!', 'UNDO', () => {
      this.plannerCourses = UNDO_COPY;
    });
    await storeData('plannerCourses', this.plannerCourses);
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
      this.savePlannerCourses([...this.plannerCourses, course]);
    }
  }

  @action async setPreviewPlannerCourse(course: PlannerCourse) {
    this.previewPlannerCourse = course;
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
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setPlannerStore('plannerCourses', JSON.parse(UNDO_COPY));
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
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setPlannerStore('plannerCourses', UNDO_COPY);
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('plannerCourses', this.plannerCourses);
    } else {
      this.notificationStore.setSnackBar('Error... OuO');
    }
  }

  @action async setAndSavePlannerCourses(courses) {
    this.setPlannerStore('plannerCourses', courses);
    await storeData('plannerCourses', this.plannerCourses);
  }

  @action async setPlannerTerm(term) {
    await storeData('plannerTerm', term);
    this.setPlannerStore('plannerTerm', term);
  }
}

export default PlannerStore;
