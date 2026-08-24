import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getRanking } from 'mongodb';

import rankingResolver from '../resolvers/ranking';

jest.mock('mongodb', () => ({
  getRanking: jest.fn(),
}));

jest.mock(
  'node-cache',
  () => ({
    __esModule: true,
    default: class {
      get = () => undefined;
      set = () => undefined;
    },
  }),
  { virtual: true }
);

jest.mock('../utils/getCourse', () => ({
  getCourse: jest.fn(courseId => ({ courseId, title: 'Course title' })),
}));

const getRankingMock = getRanking as jest.MockedFunction<typeof getRanking>;
const rankedCourses = rankingResolver.RankTable.rankedCourses as any;

describe('Public ranking access', () => {
  beforeEach(() => {
    getRankingMock.mockReset();
  });

  it('rejects fields outside the aggregate allowlist without querying data', async () => {
    await expect(
      rankedCourses(null, { filter: { rankBy: 'username' } })
    ).resolves.toEqual([]);
    expect(getRankingMock).not.toHaveBeenCalled();
  });

  it('returns aggregate course data for an allowed ranking field', async () => {
    getRankingMock.mockResolvedValue({
      ranks: [{ _id: 'CSCI1000', val: 3.5 }],
    } as any);

    await expect(
      rankedCourses(null, { filter: { rankBy: 'overall' } })
    ).resolves.toEqual([
      {
        courseId: 'CSCI1000',
        course: { courseId: 'CSCI1000', title: 'Course title' },
        overall: 3.5,
      },
    ]);
    expect(getRankingMock).toHaveBeenCalledWith('overall');
  });
});
