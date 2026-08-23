import { beforeEach, describe, expect, it } from '@jest/globals';

import { LocalPlannerService } from './LocalPlannerService';

const createStorage = () => {
  let values: Record<string, string> = {};
  return {
    clear: () => {
      values = {};
    },
    getItem: (key: string) => values[key] ?? null,
    key: (index: number) => Object.keys(values)[index] ?? null,
    get length() {
      return Object.keys(values).length;
    },
    removeItem: (key: string) => {
      delete values[key];
    },
    setItem: (key: string, value: string) => {
      values[key] = value;
    },
  };
};

describe('LocalPlannerService', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: createStorage(),
    });
    (LocalPlannerService as any).instance = undefined;
  });

  it('persists, switches, and deletes guest timetables', async () => {
    const service = LocalPlannerService.getInstance();
    const first = await service.createTimetable();
    await service.saveTimetable(first._id, { tableName: 'Fall plan' });
    const second = await service.createTimetable();

    await service.switchTimetable(first._id);
    await service.deleteAndSwitchTimetable(second._id);

    expect(await service.getSelectedTimetable()).toBe(first._id);
    expect(await service.getTimetable(first._id)).toMatchObject({
      id: first._id,
      tableName: 'Fall plan',
    });
    expect(await service.getTimetableOverviews()).toHaveLength(1);

    (LocalPlannerService as any).instance = undefined;
    const reloaded = LocalPlannerService.getInstance();
    expect(await reloaded.getSelectedTimetable()).toBe(first._id);
    expect(await reloaded.getTimetable(first._id)).toMatchObject({
      tableName: 'Fall plan',
    });
  });

  it('removes a migrated timetable without deleting other local plans', async () => {
    const service = LocalPlannerService.getInstance();
    const older = await service.createTimetable();
    const migrated = await service.createTimetable();

    service.removeMigratedTimetable(migrated._id);

    expect(await service.getTimetable(migrated._id)).toBeNull();
    expect(await service.getSelectedTimetable()).toBe(older._id);
    expect(await service.getTimetable(older._id)).not.toBeNull();
  });
});
