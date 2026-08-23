import { describe, expect, it, jest } from '@jest/globals';

import { migrateCurrentGuestTimetable } from './migrateGuestPlanner';

describe('migrateCurrentGuestTimetable', () => {
  it('removes guest data only after the cloud import succeeds', async () => {
    const planner = {
      id: 'guest-1',
      createdAt: 1,
      courses: [],
      tableName: 'My plan',
    };
    const local = {
      getSelectedTimetable: jest.fn(async () => planner.id),
      getTimetable: jest.fn(async () => planner),
      removeMigratedTimetable: jest.fn(),
    };
    const online = {
      importTimetable: jest.fn(async () => 'cloud-1'),
    };

    await expect(
      migrateCurrentGuestTimetable(local as any, online as any)
    ).resolves.toBe(true);
    expect(online.importTimetable).toHaveBeenCalledWith(planner);
    expect(local.removeMigratedTimetable).toHaveBeenCalledWith(planner.id);
  });

  it('keeps guest data when the cloud import fails', async () => {
    const local = {
      getSelectedTimetable: jest.fn(async () => 'guest-1'),
      getTimetable: jest.fn(async () => ({
        id: 'guest-1',
        createdAt: 1,
        courses: [],
        tableName: 'Keep me',
      })),
      removeMigratedTimetable: jest.fn(),
    };
    const online = {
      importTimetable: jest.fn(async () => {
        throw new Error('network unavailable');
      }),
    };

    await expect(
      migrateCurrentGuestTimetable(local as any, online as any)
    ).rejects.toThrow('network unavailable');
    expect(local.removeMigratedTimetable).not.toHaveBeenCalled();
  });

  it('does not create a cloud timetable for an untouched guest draft', async () => {
    const local = {
      getSelectedTimetable: jest.fn(async () => 'guest-1'),
      getTimetable: jest.fn(async () => ({
        id: 'guest-1',
        createdAt: 1,
        courses: [],
        tableName: '',
      })),
      removeMigratedTimetable: jest.fn(),
    };
    const online = { importTimetable: jest.fn() };

    await expect(
      migrateCurrentGuestTimetable(local as any, online as any)
    ).resolves.toBe(false);
    expect(online.importTimetable).not.toHaveBeenCalled();
    expect(local.removeMigratedTimetable).not.toHaveBeenCalled();
  });
});
