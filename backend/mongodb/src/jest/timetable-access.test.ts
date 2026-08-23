import { describe, expect, it } from '@jest/globals';

import { canReadTimetable } from '../policies/timetable';

describe('Timetable access policy', () => {
  const now = 1_700_000_000_000;

  it('allows an owner to read private or expired timetables', () => {
    expect(
      canReadTimetable(
        { username: 'owner', expire: -1, expireAt: -1 },
        'owner',
        now
      )
    ).toBe(true);
    expect(
      canReadTimetable(
        { username: 'owner', expire: 7, expireAt: now - 1 },
        'owner',
        now
      )
    ).toBe(true);
  });

  it('allows guests to read explicitly shareable timetables', () => {
    expect(canReadTimetable({ expire: 0, expireAt: -1 }, undefined, now)).toBe(
      true
    );
    expect(
      canReadTimetable({ expire: 7, expireAt: now + 1 }, undefined, now)
    ).toBe(true);
  });

  it('rejects private, expired, or malformed guest access', () => {
    expect(canReadTimetable({ expire: -1, expireAt: -1 }, undefined, now)).toBe(
      false
    );
    expect(canReadTimetable({ expire: 7, expireAt: now }, undefined, now)).toBe(
      false
    );
    expect(canReadTimetable({ expire: 7 }, undefined, now)).toBe(false);
  });
});
