import StoreManager from '../../helpers/StoreManager';
import {
  Planner,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
} from '../../types';
import { EXPIRE_LOOKUP } from '../../constants';
import { IPlannerService } from './PlannerService.interface';

const LOCAL_STORAGE_KEYS = ['timetables', 'timetableId'];
const DEFAULT_VALUES = {
  timetables: {},
  timetableId: '',
};

export class LocalPlannerService
  extends StoreManager
  implements IPlannerService
{
  private static instance: LocalPlannerService;
  timetables: Record<string, Planner> = {};
  timetableId: string;

  private constructor() {
    super(LOCAL_STORAGE_KEYS, LOCAL_STORAGE_KEYS, DEFAULT_VALUES);
    // init
    this.loadStore();
  }

  public static getInstance(): LocalPlannerService {
    if (!LocalPlannerService.instance) {
      LocalPlannerService.instance = new LocalPlannerService();
    }
    return LocalPlannerService.instance;
  }

  public async getSelectedTimetable(): Promise<string> {
    return this.timetableId;
  }

  public async deleteAndSwitchTimetable(
    id: string,
    switchTo?: string | null
  ): Promise<Planner | null> {
    delete this.timetables[id];
    this.setStore('timetables', this.timetables);

    // switch to
    if (!switchTo) return null;
    return this.switchTimetable(switchTo);
  }

  public async getTimetable(id: string): Promise<Planner | null> {
    return this.timetables[id] ?? null;
  }

  public async switchTimetable(id: string): Promise<Planner | null> {
    this.timetableId = id;
    this.setStore('timetableId', id);
    return this.getTimetable(id);
  }

  public async createTimetable(): Promise<TimetableOverviewWithMode> {
    const now = new Date().getTime();
    const overview: TimetableOverviewWithMode = {
      _id: now.toString(),
      createdAt: now,
      expireAt: -1,
      expire: EXPIRE_LOOKUP.default,
      tableName: undefined,
      mode: TimetableOverviewMode.LOCAL,
    };

    // save to local storage
    const newTimetable: Planner = {
      id: overview._id,
      courses: [],
      createdAt: overview.createdAt,
      expireAt: overview.expireAt,
      expire: overview.expire,
    };
    this.timetables[newTimetable.id] = newTimetable;
    this.setStore('timetables', this.timetables);

    return overview;
  }
}
