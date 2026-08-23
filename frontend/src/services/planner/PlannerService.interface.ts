import { Planner, PlannerDelta, TimetableOverviewWithMode } from '../../types';

export interface IPlannerService {
  getSelectedTimetable: () => Promise<string>;
  deleteAndSwitchTimetable: (
    id: string,
    // null: create new timetable | undefined: no need switch | string: switch to id
    switchTo?: string | null
  ) => Promise<Planner | null>;
  getTimetable: (id: string) => Promise<Planner | null>;
  getTimetableOverviews: () => Promise<TimetableOverviewWithMode[]>;
  switchTimetable: (id: string) => Promise<Planner | null>;
  createTimetable: () => Promise<TimetableOverviewWithMode>;
  saveTimetable: (id: string, delta: PlannerDelta) => Promise<void>;
}
