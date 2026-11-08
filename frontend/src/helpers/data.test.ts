import { _searchCourses } from './data';

jest.mock('../config', () => ({ SIMILAR_COURSE_LIMIT: 5 }));

describe('Pinned course availability', () => {
  it('uses the current-semester index instead of marking every favourite active', () => {
    const results = _searchCourses(
      {
        AIST: [
          { c: 'AIST1000', t: 'First-term course' },
          { c: 'AIST1110', t: 'Current title', o: 1 },
        ],
      },
      {
        payload: { mode: 'Pins' },
        user: {
          favoriteCourses: [
            { courseId: 'AIST1000', title: 'First-term course' },
            { courseId: 'AIST1110', title: 'Old title' },
            { courseId: 'MISS1000', title: 'Removed course' },
          ],
        } as any,
      }
    );
    expect(results).toEqual([
      { c: 'AIST1000', t: 'First-term course' },
      { c: 'AIST1110', t: 'Current title', o: 1 },
      { c: 'MISS1000', t: 'Removed course' },
    ]);
  });
});
