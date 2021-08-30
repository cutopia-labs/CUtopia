import { ErrorCode } from 'cutopia-types/lib/codes';
import { nanoid } from 'nanoid';
import { createReview, getReviews, voteReview } from './review';
import { getUser } from './user';
import { setup, teardown } from '../jest/env';

describe('Review', () => {
  let testUser;

  beforeAll(async () => (testUser = await setup()));

  afterAll(async () => await teardown(testUser));

  it('Create, Vote and Get', async () => {
    const { username } = testUser;

    const review = {
      username,
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

    const { id } = await createReview(review);
    const fakeId = nanoid(10);
    expect(createReview(review)).rejects.toThrow(
      ErrorCode.CREATE_REVIEW_ALREADY_CREATED.toString()
    );

    const voteReviewInput = {
      id,
      username,
      vote: 1,
    };
    await voteReview(voteReviewInput);
    expect(voteReview(voteReviewInput)).rejects.toThrow(
      ErrorCode.VOTE_REVIEW_VOTED_ALREADY.toString()
    );
    expect(
      voteReview({
        id,
        username,
        vote: -1,
      })
    ).rejects.toThrow(ErrorCode.VOTE_REVIEW_INVALID_VALUE.toString());
    expect(
      voteReview({
        id: fakeId,
        username,
        vote: 1,
      })
    ).rejects.toThrow(ErrorCode.VOTE_REVIEW_DNE.toString());

    /*
    const reviews = await getReviews({
      courseId: 'ABCD1234',
      sortBy: 'upvotes',
      ascending: false,
    });
    expect(reviews[0]).toMatchObject({
      ...review,
      upvotes: 1,
      upvoteUserIds: [username],
      downvotes: 0,
      downvoteUserIds: [],
    });
    */
    const reviewAuthor = await getUser({
      username,
      fields: ['upvotes'],
    });
    expect(reviewAuthor.upvotes).toEqual(1);
  });
});
