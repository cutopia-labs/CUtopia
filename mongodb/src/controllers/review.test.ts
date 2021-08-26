import { createReview, getReviews, voteReview } from './review';
import { connect } from '../';
import mongoose from 'mongoose';
import { getUser } from './user';

describe('Review', () => {
  beforeAll(async () => {
    await connect(process.env.ATLAS_DEV_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Create, Vote and Get', async () => {
    const review = {
      username: 'test',
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

    await createReview(review);

    await voteReview({
      courseId: 'ABCD1234',
      username: 'test',
      vote: 1,
    });

    const reviews = await getReviews({
      courseId: 'ABCD1234',
      sortBy: 'upvotes',
      ascending: false,
    });
    expect(reviews[0]).toMatchObject({
      ...review,
      upvotes: 1,
      upvoteUserIds: ['test'],
      downvotes: 0,
      downvoteUserIds: [],
    });
    const reviewAuthor = await getUser({
      username: 'test',
      fields: ['upvotes'],
    });
    expect(reviewAuthor.upvotes).toEqual(1);
  });
});
