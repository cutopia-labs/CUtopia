import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import { ErrorCode } from 'cutopia-types';
import { nanoid } from 'nanoid';

import {
  createReview,
  formatReviewId,
  getReviews,
  voteReview,
} from '../controllers/review';
import { getUser } from '../controllers/user';
import ReviewModel from '../models/review';

import { createTestUser, deleteTestUser, setup, teardown } from './env';

describe('Review', () => {
  let testUser;

  beforeAll(async () => {
    await setup();
    // Empty the review documents
    await ReviewModel.deleteMany({});
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser);
    await teardown();
  });

  it('Create, Vote and Get Review', async () => {
    const { username } = testUser;

    const review = {
      username,
      courseId: 'AIST1110',
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

    const { createdAt } = await createReview(review);
    const _id = formatReviewId(review['courseId'], createdAt);
    expect(createReview(review)).rejects.toThrow(
      ErrorCode.CREATE_REVIEW_ALREADY_CREATED.toString()
    );

    const voteReviewInput = {
      _id,
      username,
      vote: 1,
    };
    await voteReview(voteReviewInput);
    expect(voteReview(voteReviewInput)).rejects.toThrow(
      ErrorCode.VOTE_REVIEW_VOTED_ALREADY.toString()
    );
    expect(
      voteReview({
        _id,
        username,
        vote: -1,
      })
    ).rejects.toThrow(ErrorCode.VOTE_REVIEW_INVALID_VALUE.toString());
    expect(
      voteReview({
        _id: nanoid(10),
        username,
        vote: 1,
      })
    ).rejects.toThrow(ErrorCode.VOTE_REVIEW_DNE.toString());

    const reviews = await getReviews({
      courseId: 'AIST1110',
      sortBy: 'upvotes',
      ascending: false,
    });
    expect(reviews[0]).toMatchObject({
      ...review,
      _id,
      createdAt,
      upvotes: 1,
      upvoteUserIds: [username],
      downvotes: 0,
      downvoteUserIds: [],
    });
    const reviewAuthor = await getUser(username, 'upvotes');
    expect(reviewAuthor?.upvotes).toEqual(1);
  });
});
