import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';

import { getRanking, rankCourses } from '../controllers/ranking';
import { createReview } from '../controllers/review';
import CourseModel from '../models/course';
import RankingModel from '../models/ranking';

import { createTestUser, deleteTestUser, setup, teardown } from './env';

describe('Ranking', () => {
  let testUser, testUser2;

  beforeAll(async () => {
    await setup();
    // Empty the ranking and course documents
    await RankingModel.deleteMany({});
    await CourseModel.deleteMany({});
    testUser = await createTestUser();
    testUser2 = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser);
    await deleteTestUser(testUser2);
    await teardown();
  });

  it('Create review and update ranking', async () => {
    const review = {
      username: testUser.username,
      courseId: 'ABCD1234',
      anonymous: false,
      lecturer: 'Someone',
      term: '1',
      overall: 4,
      grading: {
        grade: 3,
        text: 'Some text',
      },
      teaching: {
        grade: 2,
        text: 'Some text',
      },
      difficulty: {
        grade: 1,
        text: 'Some text',
      },
      content: {
        grade: 0,
        text: 'Some text',
      },
    };
    const review2 = {
      ...review,
      username: testUser2.username,
      grading: {
        grade: 4,
        text: 'Some text',
      },
    };
    await createReview(review);
    await createReview(review2);

    await rankCourses();
    expect(getRanking('numReviews')).resolves.toMatchObject({
      _id: 'numReviews',
      ranks: [{ _id: 'ABCD1234', val: 2 }],
    });
    expect(getRanking('grading')).resolves.toMatchObject({
      _id: 'grading',
      ranks: [{ _id: 'ABCD1234', val: 3.5 }],
    });
  });
});
