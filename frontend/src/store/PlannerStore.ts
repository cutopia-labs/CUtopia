import { makeObservable, observable, action } from 'mobx';
import { cloneDeep, isEqual } from 'lodash';
import {
  PlannerCourse,
  Planner,
  CourseSection,
  OverlapSections,
  TimetableInfo,
  TimetableOverviewWithMode,
  PlannerDelta,
  PlannerSyncState,
  DatedData,
  StoreWithLoading,
} from '../types';
import withUndo from '../helpers/withUndo';
import { getDurationInHour, timeInRange } from '../helpers/timetable';
import { EXPIRE_LOOKUP, makeSectionLabel } from '../constants';
import { storeData } from '../helpers/store';
import { daysDiff } from '../helpers/getTime';
import { jsonCloneDeep } from '../helpers';
import withLoading from '../helpers/withLoading';
import { IPlannerService } from '../services/planner/PlannerService.interface';
import { OnlinePlannerService } from '../services/planner/OnlinePlannerService';
import { LocalPlannerService } from '../services/planner/LocalPlannerService';
import UserStore from './UserStore';
import ViewStore from './ViewStore';
import StorePrototype from './StorePrototype';

const LOAD_KEYS = ['shareMap'];

const RESET_KEYS = LOAD_KEYS;

const DEFAULT_VALUES = {
  plannerName: '',
  plannerId: '',
  shareMap: {},
};

const STORAGE_CONFIG = {};

class PlannerStore extends StorePrototype implements StoreWithLoading {
  @observable planner: Planner; // Store info like current id, old courses, and tableName
  @observable plannerId: string;
  @observable plannerName: string;
  @observable previewPlannerCourse: PlannerCourse;
  @observable plannerCourses: PlannerCourse[] = [];
  @observable timetableOverviews: TimetableOverviewWithMode[] | null = null;
  @observable isSyncing = false;
  @observable shareMap: Record<string, DatedData<string>>;
  @observable loading = false;
  @observable offline: boolean = null;

  viewStore: ViewStore;
  userStore: UserStore;
  service: IPlannerService;

  constructor(viewStore: ViewStore, userStore: UserStore) {
    super(LOAD_KEYS, RESET_KEYS, DEFAULT_VALUES, STORAGE_CONFIG);
    makeObservable(this);
    this.viewStore = viewStore;
    this.userStore = userStore;

    this.deleteTimetable = this.deleteTimetable.bind(this);
    this.createTimetable = this.createTimetable.bind(this);
  }

  @action setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  @action init = () => {
    this.loadStore();
    this.setOffline();

    /* Check for expired share map, if so remove it */
    const toBeDeleted = [];
    const now = +new Date();
    const shareMap: any = jsonCloneDeep(this.shareMap);
    Object.entries(shareMap).forEach(([k, v]: [string, any]) => {
      if (daysDiff(now, v.time) >= 7) {
        toBeDeleted.push(k);
      }
    });
    toBeDeleted.forEach(k => delete shareMap[k]);
    this.setStore('shareMap', shareMap);

    this.userStore.setPlannerStore(this);
  };

  @action
  @withLoading
  async initializePlanner() {
    this.updateStore(
      'timetableOverviews',
      await this.service.getTimetableOverviews()
    );
    const selectedId = await this.service.getSelectedTimetable();
    const selectedPlanner = selectedId
      ? await this.service.getTimetable(selectedId)
      : null;

    if (selectedPlanner) {
      this.updateCurrentPlanner(selectedPlanner);
      return;
    }
    await this.createTimetable();
  }

  @action
  async createTimetable(): Promise<boolean> {
    this.setLoading(true);
    try {
      const overview = await this.service.createTimetable();
      this.updateTimetableOverview(overview, true);
      this.updateCurrentPlanner({
        id: overview._id,
        createdAt: overview.createdAt,
        expire: overview.expire,
        expireAt: overview.expireAt,
        tableName: overview.tableName || '',
        courses: [],
      });
      return true;
    } catch (error) {
      this.viewStore.handleError(error);
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  @action
  @withLoading
  async switchTimetable(id: string) {
    if (id === this.plannerId) return;
    await this.saveCurrentPlanner();
    const destination = await this.service.switchTimetable(id);
    if (destination) {
      this.updateCurrentPlanner(destination);
      this.viewStore.setSnackBar(
        `Switched to ${destination.tableName || 'New Timetable'}`
      );
    }
  }

  @action
  @withLoading
  async deleteTimetable(id: string) {
    const isCurrTimetable = id === this.plannerId;
    /* Undefined switch to means not deleting current ttb, no need switch */
    let switchTo = undefined;
    if (isCurrTimetable) {
      let maxCreatedAt = 0;
      /* If it's the last ttb, then switch to null means create one */
      switchTo = null;
      // switch to the latest timetable
      this.timetableOverviews.forEach(d => {
        if (d.createdAt > maxCreatedAt && d._id !== id) {
          maxCreatedAt = d.createdAt;
          switchTo = d._id;
        }
      });
    }

    const destPlanner = await this.service.deleteAndSwitchTimetable(
      id,
      switchTo
    );

    this.viewStore.setSnackBar('Deleted!');

    /* Update the timetableOverviews */
    this.removeTimetableOverview(id);

    if (isCurrTimetable) {
      if (destPlanner) {
        this.updateCurrentPlanner(destPlanner);
      } else {
        await this.createTimetable();
      }
    }
  }

  @action.bound async saveCurrentPlanner() {
    const delta = this.delta;
    if (!delta || !this.plannerId || this.isSyncing) return;
    this.isSyncing = true;
    const savedDelta = cloneDeep(delta);
    try {
      await this.service.saveTimetable(this.plannerId, savedDelta);
      this.syncPlanner(savedDelta);
      this.updateTimetableOverview({
        _id: this.plannerId,
        tableName: this.plannerName,
      });
    } catch (error) {
      this.viewStore.handleError(error);
    } finally {
      this.isSyncing = false;
    }
  }

  @action
  async importLocalTimetable(importedPlanner: Planner): Promise<boolean> {
    if (!this.offline) return false;
    this.setLoading(true);
    try {
      const overview = await this.service.createTimetable();
      const localPlanner: Planner = {
        ...importedPlanner,
        id: overview._id,
        createdAt: overview.createdAt,
        expire: EXPIRE_LOOKUP.upload,
        expireAt: -1,
        courses: cloneDeep(importedPlanner.courses),
      };
      await this.service.saveTimetable(localPlanner.id, {
        tableName: localPlanner.tableName,
        courses: localPlanner.courses,
      });
      this.updateTimetableOverview(
        {
          ...overview,
          tableName: localPlanner.tableName,
        },
        true
      );
      this.updateCurrentPlanner(localPlanner);
      return true;
    } catch (error) {
      this.viewStore.handleError(error);
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  get syncState(): PlannerSyncState {
    if (this.isSyncing) return PlannerSyncState.SYNCING;
    return this.delta ? PlannerSyncState.DIRTY : PlannerSyncState.SYNCED;
  }

  get delta() {
    const delta: PlannerDelta = {};
    let dirty = false;
    const prevPlannerName = this.planner?.tableName;
    // need either old / new to be non empty for the delta to be valid
    if (
      this.plannerName !== prevPlannerName &&
      (this.plannerName || prevPlannerName)
    ) {
      delta['tableName'] = this.plannerName;
      dirty = true;
    }
    if (!isEqual(this.plannerCourses, this.planner?.courses)) {
      delta.courses = this.plannerCourses;
      dirty = true;
    }
    return dirty ? delta : null;
  }

  get timetableInfo(): TimetableInfo {
    let maxDay = 5;
    const info: TimetableInfo = {
      totalCredits: 0,
      averageHour: 0,
      weekdayAverageHour: {},
      tbaSections: {},
    };
    this.plannerCourses?.forEach((course, courseIdx) => {
      let unhide = false;
      Object.values(course.sections).forEach(section => {
        if (!section.hide) {
          unhide = true;
          for (let i = 0; i < section.days.length; i++) {
            let day = parseInt(section.days[i] as any, 10);
            const sectionDuration = getDurationInHour(section, i);
            // If no a number, then it's TBA section, remove from credit calc
            if (Number.isNaN(sectionDuration) || Number.isNaN(day)) {
              info.tbaSections[makeSectionLabel(section, course.courseId)] = {
                name: section.name,
                courseIndex: courseIdx,
              };
              break;
            }
            // If sunday course
            if (day === 0) {
              day = 7;
            }
            if (day > maxDay) {
              maxDay = day;
            }
            info.weekdayAverageHour[day] = info.weekdayAverageHour[day] || 0;
            info.weekdayAverageHour[day] += sectionDuration;
          }
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
        const sectionXKey = makeSectionLabel(sectionX, sectionX.courseId);
        const sectionYKey = makeSectionLabel(sectionY, sectionY.courseId);
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

  @action addToShareMap = (shareId: string, cloneId: string) => {
    this.shareMap[shareId] = {
      value: cloneId,
      time: +new Date(),
    };
    storeData('shareMap', this.shareMap);
  };

  @action inShareMap = (shareId: string) => {
    return this.shareMap[shareId]?.value;
  };

  @action findIndexInPlanner = courseId =>
    this.plannerCourses?.findIndex(item => item.courseId === courseId);

  @action updateCurrentPlanner = (planner: Planner) => {
    this.updateStore('plannerId', planner.id); // Store current planner Id and update mem
    planner.tableName = planner.tableName || '';
    this.planner = planner;
    this.plannerName = planner.tableName;
    this.plannerCourses = cloneDeep(this.planner.courses);
  };

  @action.bound syncPlanner = delta => {
    this.planner = {
      ...this.planner,
      ...delta,
    };
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

  @action setOnline = () => {
    if (this.offline === false && this.service) return;
    this.offline = false;
    this.service = OnlinePlannerService.getInstance();
    this.planner = undefined;
    this.plannerId = '';
    this.plannerName = '';
    this.plannerCourses = [];
    this.timetableOverviews = null;
  };

  @action setOffline = () => {
    if (this.offline === true && this.service) return;
    this.offline = true;
    this.service = LocalPlannerService.getInstance();
    this.planner = undefined;
    this.plannerId = '';
    this.plannerName = '';
    this.plannerCourses = [];
    this.timetableOverviews = null;
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
        const UPDATE_COPY: PlannerCourse[] = cloneDeep(this.plannerCourses);
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
          const sectionCopy = cloneDeep(this.plannerCourses[index].sections);
          delete sectionCopy[sectionId];
          if (JSON.stringify(sectionCopy) !== JSON.stringify({})) {
            this.plannerCourses[index] = {
              ...this.plannerCourses[index],
              sections: sectionCopy,
            };
          } else {
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

  // Timetable Overview
  @action updateTimetableOverview = (
    overview: Partial<TimetableOverviewWithMode>,
    isAdd = false
  ) => {
    const overviewIdx =
      isAdd || !this.timetableOverviews
        ? -1
        : this.timetableOverviews.findIndex(o => o._id === overview._id);
    // Update overview if found, otherwise add to overview
    if (overviewIdx >= 0) {
      this.timetableOverviews[overviewIdx] = {
        ...this.timetableOverviews[overviewIdx],
        ...overview,
      };
    } else {
      this.updateStore('timetableOverviews', [
        ...(this.timetableOverviews || []),
        overview,
      ]);
    }
  };

  @action removeTimetableOverview = (id: string) => {
    this.updateStore(
      'timetableOverviews',
      [...(this.timetableOverviews || [])].filter(item => item._id !== id)
    );
  };
}

export default PlannerStore;
