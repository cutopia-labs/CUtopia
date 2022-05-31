import { makeObservable, observable, action } from 'mobx';

import {
  PlannerCourse,
  Planner,
  CourseSection,
  OverlapSections,
  TimetableInfo,
  TimetableOverviewWithMode,
} from '../types';

import withUndo from '../helpers/withUndo';
import { getDurationInHour, timeInRange } from '../helpers/timetable';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = ['plannerId'];

const RESET_KEYS = LOAD_KEYS;

const DEFAULT_VALUES = {};

class PlannerStore extends StorePrototype {
  @observable syncIntervalId: NodeJS.Timer;
  @observable planner: Planner; // Store info like current id, old courses, and tableName
  @observable plannerId: string;
  @observable plannerName: string;
  @observable previewPlannerCourse: PlannerCourse;
  @observable plannerCourses: PlannerCourse[] = [];
  @observable remoteTimetableData: TimetableOverviewWithMode[] | null = null;

  viewStore: ViewStore;

  constructor(viewStore: ViewStore) {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES);
    makeObservable(this);
    this.viewStore = viewStore;
  }

  @action init = () => {
    console.log('Init planner store');
    this.loadStore();
  };

  @action newPlanner = (id: string, createdAt: number) => {
    const planner = {
      id,
      createdAt,
      courses: [],
    };
    this.plannerId = id;
    this.planner = planner;
    this.plannerCourses = [];
  };

  @action clearSync = () => clearInterval(this.syncIntervalId);

  get timetableIds() {
    return this.remoteTimetableData.map(d => d._id);
  }

  get timetableInfo(): TimetableInfo {
    let maxDay = 5;
    const info: TimetableInfo = {
      totalCredits: 0,
      averageHour: 0,
      weekdayAverageHour: {},
    };
    this.plannerCourses?.forEach((course, i) => {
      let unhide = false;
      Object.values(course.sections).forEach(section => {
        if (!section.hide) {
          unhide = true;
          section.days.forEach((day, i) => {
            if (day > maxDay) {
              maxDay = day;
            }
            info.weekdayAverageHour[day] = info.weekdayAverageHour[day] || 0;
            info.weekdayAverageHour[day] += getDurationInHour(section, i);
          });
        }
      });
      if (unhide) {
        info.totalCredits += course.credits;
      }
    });
    Object.values(info.weekdayAverageHour).forEach(
      hr => (info.averageHour += hr)
    );
    info.averageHour /= maxDay;
    return info;
  }

  get currentSections() {
    return (this.plannerCourses || [])
      .map((course, i) =>
        Object.values(course.sections).map(section => ({
          hide: section.hide,
          name: section.name,
          courseId: course.courseId,
          courseIndex: i,
        }))
      )
      ?.flat();
  }

  get hidedSections() {
    return this.currentSections.filter(section => section.hide);
  }

  get overlapSections() {
    const sections = [];
    this.plannerCourses?.forEach((course, i) =>
      Object.values(course.sections).forEach(section => {
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
  @action reset = () => {
    this.resetStore();
  };

  @action findIndexInPlanner = courseId =>
    this.plannerCourses?.findIndex(item => item.courseId === courseId);

  @action updateCurrentPlanner = (planner: Planner) => {
    this.setStore('plannerId', planner.id); // Store current planner Id and update mem
    this.planner = planner;
    this.plannerName = planner.tableName;
    this.plannerCourses = JSON.parse(JSON.stringify(this.planner.courses));
  };

  @action clearPlannerCourses = () => {
    withUndo(
      {
        prevData: [...this.plannerCourses],
        setData: prevData => this.updateStore('plannerCourses', prevData),
        message: 'Cleared planner!',
        viewStore: this.viewStore,
      },
      () => {
        this.updateStore('plannerCourses', []);
      }
    );
  };

  @action updatePlannerCourse = (course: PlannerCourse, index: number) => {
    this.plannerCourses[index] = course;
  };

  @action updatePlannerSection = (
    section: CourseSection,
    index: number,
    sectionKey: string
  ) => {
    this.plannerCourses[index] = {
      ...this.plannerCourses[index],
      sections: {
        ...this.plannerCourses[index].sections,
        [sectionKey]: section,
      },
    };
  };

  @action filterEmptySectionCourses = (plannerCourses?: PlannerCourse[]) =>
    (plannerCourses || this.plannerCourses).filter(
      course => Object.keys(course.sections)?.length
    );

  @action removeHidedCourses = () => {
    withUndo(
      {
        prevData: this.plannerCourses,
        setData: prevData => this.updateStore('plannerCourses', prevData),
        message: 'Removed unchecked courses',
        stringify: true,
        viewStore: this.viewStore,
      },
      () => {
        const UPDATE_COPY: PlannerCourse[] = JSON.parse(
          JSON.stringify(this.plannerCourses)
        );
        this.hidedSections.forEach(section => {
          delete UPDATE_COPY[section.courseIndex].sections[section.name];
        });
        this.updateStore(
          'plannerCourses',
          this.filterEmptySectionCourses(UPDATE_COPY)
        );
      }
    );
  };

  @action addToPlannerCourses = (course: PlannerCourse) => {
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
    } else {
      this.updateStore('plannerCourses', [...this.plannerCourses, course]);
    }
  };

  @action deleteSectionInPlannerCourses = ({ courseId, sectionId }) => {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      withUndo(
        {
          prevData: this.plannerCourses,
          setData: prevData => this.updateStore('plannerCourses', prevData),
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
        }
      );
    } else {
      this.viewStore.setSnackBar('Error... OuO');
    }
  };

  @action deleteInPlannerCourses = courseId => {
    const index = this.findIndexInPlanner(courseId);
    if (index !== -1) {
      withUndo(
        {
          prevData: [...this.plannerCourses],
          setData: prevData => this.updateStore('plannerCourses', prevData),
          message: 'Course deleted!',
          viewStore: this.viewStore,
        },
        () => {
          this.plannerCourses?.splice(index, 1);
        }
      );
    } else {
      this.viewStore.setSnackBar('Error... OuO');
    }
  };

  @action setPlannerLabel = (tableName: string) => {
    this.planner.tableName = tableName;
  };
}

export default PlannerStore;
