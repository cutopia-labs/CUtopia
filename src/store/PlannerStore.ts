import { makeObservable, observable, action, toJS } from 'mobx';

import {
  PlannerCourse,
  Planner,
  PlannerItem,
  CourseSection,
  OverlapSections,
  TimeTableInfo,
} from '../types';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

import { PLANNER_CONFIGS } from '../constants/configs';
import withUndo from '../helpers/withUndo';
import timeInRange from '../helpers/timeInRange';
import { getDurationInHour } from '../helpers/timetable';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';

const LOCAL_STORAGE_KEYS = ['planners', 'plannerTerm', 'currentPlannerKey'];

class PlannerStore extends StorePrototype {
  // Planner
  @observable planners: Record<string | number, Planner> = {};
  @observable plannerTerm: string;
  @observable previewPlannerCourse: PlannerCourse;
  @observable currentPlannerKey: number;
  @observable plannerCourses: PlannerCourse[] = [];
  @observable initiated: boolean = false; // prevent reaction of null timetable override planners

  viewStore: ViewStore;

  constructor(viewStore: ViewStore) {
    super();
    makeObservable(this);
    this.viewStore = viewStore;
  }

  @action async init() {
    await this.applyPlannerStore();
    if (!this.currentPlannerKey) {
      console.log('Creating new planners');
      const now = +new Date();
      this.setStore('currentPlannerKey', now);
      this.setStore('planners', {
        [now]: {
          key: now,
          courses: [],
        },
      });
    }
    this.plannerCourses = this.planners[this.currentPlannerKey]?.courses || [];
    this.initiated = true;
  }

  get timetableInfo(): TimeTableInfo {
    let maxDay = 5;
    const info: TimeTableInfo = {
      totalCredits: 0,
      averageHour: 0,
      weekdayAverageHour: {},
    };
    this.plannerCourses?.forEach((course, i) => {
      info.totalCredits += +course.credit;
      Object.values(course.sections).forEach((section) => {
        if (!section.hide) {
          section.days.forEach((day, i) => {
            if (day > maxDay) {
              maxDay = day;
            }
            info.weekdayAverageHour[day] = info.weekdayAverageHour[day] || 0;
            info.weekdayAverageHour[day] += getDurationInHour(section, i);
          });
        }
      });
      Object.values(info.weekdayAverageHour).forEach(
        (hr) => (info.averageHour += hr)
      );
      info.averageHour /= maxDay;
    });
    return info;
  }

  get hidedSections() {
    const sections = [];
    this.plannerCourses?.forEach((course, i) =>
      Object.values(course.sections).forEach((section) => {
        if (section.hide) {
          sections.push({
            ...section,
            courseId: course.courseId,
            courseIndex: i,
          });
        }
      })
    );
    return sections;
  }

  get plannerList() {
    return Object.values(this.planners).map((planner) => ({
      key: planner.key,
      label: planner.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
    })) as PlannerItem[];
  }

  get currentPlanner() {
    return this.planners[this.currentPlannerKey];
  }

  get overlapSections() {
    const sections = [];
    this.plannerCourses?.forEach((course, i) =>
      Object.values(course.sections).forEach((section) => {
        if (section && !section.hide) {
          sections.push({
            ...section,
            courseId: course.courseId,
            courseIndex: i,
          });
        }
      })
    );
    const overlapSections: OverlapSections = {};
    sections.forEach((sectionX, i) => {
      sections.forEach((sectionY, j) => {
        if (i === j || !sectionX || !sectionY) {
          return;
        }
        const sectionXKey = `${sectionX.courseId} ${sectionX.name}`;
        const sectionYKey = `${sectionY.courseId} ${sectionY.name}`;
        if (sectionXKey in overlapSections || sectionYKey in overlapSections) {
          return;
        }
        const overlapTime = timeInRange(sectionX, sectionY); // overlapped sectionY time
        if (overlapTime) {
          overlapSections[sectionXKey] = {
            name: sectionYKey,
            courseIndex: sectionY.courseIndex,
            sectionKey: sectionY.key,
          };
          overlapSections[sectionYKey] = {
            name: sectionXKey,
            courseIndex: sectionX.courseIndex,
            sectionKey: sectionX.key,
          };
        }
      });
    });
    return overlapSections;
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
    return this.plannerCourses?.findIndex((item) => item.courseId === courseId);
  };

  @action.bound validKey = (key: number) =>
    Boolean(this.initiated && this.planners && key && key in this.planners);

  @action updateCurrentPlanner = (key: number) => {
    let label = PLANNER_CONFIGS.DEFAULT_TABLE_NAME;
    if (this.validKey(key)) {
      this.plannerCourses = this.planners[key].courses;
      this.currentPlannerKey = key;
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
    this.setStore('currentPlannerKey', key);
    this.viewStore.setSnackBar(`Switched to ${label}`);
  };

  @action sectionInPlanner = (courseId, sectionId) => {
    const index = this.findIndexInPlanner(courseId);
    if (index === -1 || !this.plannerCourses) {
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
      storeData('planners', this.planners);
    }
  }

  @action async addPlanner(planner: Planner) {
    this.planners[planner.key] = planner;
    console.log(`Updated planner with ${toJS(this.planners)}`);
    storeData('planners', this.planners);
  }

  @action async deletePlanner(key: number) {
    if (this.validKey(key)) {
      withUndo(
        {
          prevData: this.planners,
          setData: (prevData) => this.setStore('planners', prevData),
          message: 'Deleted planner!',
          stringify: true,
          viewStore: this.viewStore,
        },
        () => {
          delete this.planners[key];
          this.updateCurrentPlanner(
            parseInt(Object.keys(this.planners)[0], 10)
          );
        }
      );
    } else {
      this.viewStore.setSnackBar('Error... OuO');
    }
  }

  @action async clearPlannerCourses() {
    withUndo(
      {
        prevData: [...this.plannerCourses],
        setData: (prevData) => this.setStore('plannerCourses', prevData),
        message: 'Cleared planner!',
        viewStore: this.viewStore,
      },
      () => {
        this.setStore('plannerCourses', []);
      }
    );
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

  @action.bound filterEmptySectionCourses = (
    plannerCourses?: PlannerCourse[]
  ) =>
    (plannerCourses || this.plannerCourses).filter(
      (course) => Object.keys(course.sections)?.length
    );

  @action async removeHidedCourses() {
    withUndo(
      {
        prevData: this.plannerCourses,
        setData: (prevData) => this.setStore('plannerCourses', prevData),
        message: 'Removed unchecked courses',
        stringify: true,
        viewStore: this.viewStore,
      },
      () => {
        const UPDATE_COPY: PlannerCourse[] = JSON.parse(
          JSON.stringify(this.plannerCourses)
        );
        UPDATE_COPY.forEach((course, courseIndex) => {
          Object.entries(course.sections).forEach(([k, v]) => {
            if (v.hide) {
              delete UPDATE_COPY[courseIndex].sections[k];
            }
          });
        });
        this.setStore(
          'plannerCourses',
          this.filterEmptySectionCourses(UPDATE_COPY)
        );
      }
    );
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
      storeData('plannerCourses', this.plannerCourses);
    } else {
      this.setStore('plannerCourses', [...this.plannerCourses, course]);
    }
  }

  @action async deleteSectionInPlannerCourses({ courseId, sectionId }) {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      withUndo(
        {
          prevData: this.plannerCourses,
          setData: (prevData) => this.setStore('plannerCourses', prevData),
          message: 'Section deleted!',
          stringify: true,
          viewStore: this.viewStore,
        },
        () => {
          const sectionCopy = JSON.parse(
            JSON.stringify(this.plannerCourses[index].sections)
          );
          delete sectionCopy[sectionId];
          if (JSON.stringify(sectionCopy) !== JSON.stringify({})) {
            this.plannerCourses[index] = {
              ...this.plannerCourses[index],
              sections: sectionCopy,
            };
          } else {
            console.log('Delete the planner course');
            this.plannerCourses?.splice(index, 1);
          }
          storeData('plannerCourses', this.plannerCourses);
        }
      );
    } else {
      this.viewStore.setSnackBar('Error... OuO');
    }
  }

  @action async deleteInPlannerCourses(courseId) {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      withUndo(
        {
          prevData: [...this.plannerCourses],
          setData: (prevData) => this.setStore('plannerCourses', prevData),
          message: 'Course deleted!',
          viewStore: this.viewStore,
        },
        () => {
          this.plannerCourses?.splice(index, 1);
          storeData('plannerCourses', this.plannerCourses);
        }
      );
    } else {
      this.viewStore.setSnackBar('Error... OuO');
    }
  }

  @action async setPlannerLabel(label: string) {
    this.planners[this.currentPlannerKey].label = label;
    storeData('planners', this.planners);
  }
}

export default PlannerStore;
