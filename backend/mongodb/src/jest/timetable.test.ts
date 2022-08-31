import { describe, beforeAll, afterAll, it } from '@jest/globals';
import { ErrorCode } from 'cutopia-types';

import { getTimetable, removeTimetable, uploadTimetable } from '../controllers';
import TimetableModel from '../models/timetable';

import { createTestUser, deleteTestUser, setup, teardown } from './env';

describe('Timetable', () => {
  let testUser;
  const timetable = {
    expire: -1,
    entries: [
      {
        courseId: 'AIST3010',
        title: 'Numerical Optimization',
        credits: 2,
        sections: [
          {
            days: ['1'],
            endTimes: ['14:15'],
            startTimes: ['12:30'],
            instructors: [],
            locations: ['William M W Mong Eng Bldg 804'],
            hide: false,
            name: '- - LEC',
          },
          {
            days: ['4'],
            endTimes: ['18:15'],
            startTimes: ['17:30'],
            instructors: [],
            locations: ['Mong Man Wai Bldg 705'],
            hide: false,
            name: '-T01 - TUT',
          },
        ],
      },
    ],
  };

  beforeAll(async () => {
    await setup();
    // Empty the timetable documents
    await TimetableModel.deleteMany({});
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser);
    await teardown();
  });

  it('Create, update and delete timetable', async () => {
    const { username } = testUser;
    const { _id } = await uploadTimetable({
      ...timetable,
      username,
    });

    const newEntry = {
      courseId: 'CSCI3230',
      title: 'Fundamentals of AI',
      credits: 3,
      sections: [
        {
          days: ['4', '2'],
          endTimes: ['11:15', '16:15'],
          startTimes: ['10:30', '14:30'],
          instructors: [],
          locations: ['Science Centre L1', 'Science Centre L1'],
          hide: false,
          name: '- - LEC',
        },
        {
          days: ['3'],
          endTimes: ['14:15'],
          startTimes: ['13:30'],
          instructors: [],
          locations: ['Mong Man Wai Bldg LT2'],
          hide: false,
          name: '-T01 - TUT',
        },
      ],
    };
    const newTimetableInput = {
      ...timetable,
      _id,
      username,
      entries: [...timetable.entries, newEntry],
    };
    await uploadTimetable(newTimetableInput);
    expect(getTimetable({ _id, username })).resolves.toMatchObject(
      newTimetableInput
    );

    await removeTimetable({ _id, username });
    expect(getTimetable({ _id })).rejects.toThrow(
      ErrorCode.GET_TIMETABLE_INVALID_ID.toString()
    );
  });

  it('Forbid illegal access', async () => {
    const { username } = testUser;
    const { _id } = await uploadTimetable({
      ...timetable,
      username,
    });
    expect(getTimetable({ _id, username: 'Bad guy' })).rejects.toThrow(
      ErrorCode.GET_TIMETABLE_UNAUTHORIZED.toString()
    );
  });
});
