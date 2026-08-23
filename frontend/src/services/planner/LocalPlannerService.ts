import StoreManager from '../../helpers/StoreManager';
import {
  Planner,
  PlannerDelta,
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
    const { [id]: deleted, ...timetables } = this.timetables;
    this.setStore('timetables', timetables);

    // switch to
    if (switchTo === null) {
      this.setStore('timetableId', '');
      return null;
    }
    if (switchTo === undefined) return null;
    return this.switchTimetable(switchTo);
  }

  public async getTimetable(id: string): Promise<Planner | null> {
    return this.timetables[id] ?? null;
  }

  public async switchTimetable(id: string): Promise<Planner | null> {
    if (!this.timetables[id]) return null;
    this.setStore('timetableId', id);
    return this.getTimetable(id);
  }

  public async getTimetableOverviews(): Promise<TimetableOverviewWithMode[]> {
    return Object.values(this.timetables)
      .map(timetable => ({
        _id: timetable.id,
        createdAt: timetable.createdAt,
        tableName: timetable.tableName || null,
        expireAt: timetable.expireAt ?? -1,
        expire: timetable.expire ?? EXPIRE_LOOKUP.upload,
        mode: TimetableOverviewMode.LOCAL,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  public async createTimetable(): Promise<TimetableOverviewWithMode> {
    const now = new Date().getTime();
    const id = `guest-${now.toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const overview: TimetableOverviewWithMode = {
      _id: id,
      createdAt: now,
      expireAt: -1,
      expire: EXPIRE_LOOKUP.upload,
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
    this.setStore('timetables', {
      ...this.timetables,
      [newTimetable.id]: newTimetable,
    });
    this.setStore('timetableId', newTimetable.id);

    return overview;
  }

  public async saveTimetable(id: string, delta: PlannerDelta): Promise<void> {
    const timetable = this.timetables[id];
    if (!timetable) return;
    this.setStore('timetables', {
      ...this.timetables,
      [id]: {
        ...timetable,
        ...delta,
      },
    });
  }
}
