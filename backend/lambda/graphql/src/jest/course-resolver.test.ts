import { describe, expect, it, jest } from '@jest/globals';

const getCourseDataFromDB = jest.fn();

jest.mock('mongodb', () => ({
  getCourse: getCourseDataFromDB,
}));
jest.mock(
  'node-cache',
  () =>
    jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
  { virtual: true }
);
jest.mock('../utils/getCourse', () => ({
  getCourse: () => ({
    courseId: 'CSCI1120',
    terms: { '2026-27 Term 1': {} },
    title: 'Introduction to Computing Using C++',
  }),
}));

import coursesResolver from '../resolvers/course';

const resolveCourse = coursesResolver.Query.course as any;

describe('course resolver', () => {
  it('serves guest catalog data without querying MongoDB', async () => {
    const result = await resolveCourse(
      null,
      {
        filter: {
          requiredCourse: 'CSCI1120',
          requiredTerm: '2026-27 Term 1',
        },
      },
      { ip: '127.0.0.1', user: null }
    );

    expect(result).toMatchObject({
      courseId: 'CSCI1120',
      title: 'Introduction to Computing Using C++',
    });
    expect(getCourseDataFromDB).not.toHaveBeenCalled();
  });
});
