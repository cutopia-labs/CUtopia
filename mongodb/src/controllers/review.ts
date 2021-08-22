import { nanoid } from 'nanoid';
import NodeCache from 'node-cache';
import { ErrorCode, VoteAction } from 'cutopia-types/lib/codes';

import Review from '../models/review.model';
import User from '../models/user.model';
import withCache from '../utils/withCache';
import { updateCourseDataFromReview } from './course';
import { REVIEWS_PER_PAGE } from '../constant/configs';

const reviewCache = new NodeCache({
  stdTTL: 1800,
});

export const createReview = async input => {
  const { username, courseId, ...reviewData } = input;
  const reviewId = nanoid(10);

  const user = await User.findOne({ username }, 'reviews exp').exec();
  if (
    !user ||
    user.reviews.some(review => review.courseId.includes(courseId))
  ) {
    throw Error(ErrorCode.CREATE_REVIEW_ALREADY_CREATED.toString());
  }
  // give extra exp for writing the first review
  user.exp += user.reviews.length === 0 ? 5 : 3;

  const newReview = new Review({
    username,
    courseId,
    reviewId,
    upvoteUserIds: [],
    upvotes: 0,
    downvoteUserIds: [],
    downvotes: 0,
    ...reviewData,
  });

  await user.save();
  await newReview.save();
  await updateCourseDataFromReview(courseId, reviewData);

  return {
    id: reviewId,
    createdAt: newReview.createdAt,
  };
};

export const getReview = async input =>
  withCache(reviewCache, `${input.courseId}_${input.createdAt}`, async () => {
    return await Review.findOne(input).exec();
  });

export const voteReview = async input => {
  const { courseId, username, vote } = input;
  if (vote !== VoteAction.UPVOTE && vote !== VoteAction.DOWNVOTE) {
    // vote must be either 0 or 1
    throw Error(ErrorCode.VOTE_REVIEW_INVALID_VALUE.toString());
  }
  const isUpvote = vote === VoteAction.UPVOTE;
  const voteListField = isUpvote ? 'upvoteUserIds' : 'downvoteUserIds';
  const voteCountField = isUpvote ? 'upvotes' : 'downvotes';

  await Review.updateOne(
    {
      courseId,
      username,
      upvoteUserIds: {
        $nin: username,
      },
      downvoteUserIds: {
        $nin: username,
      },
    },
    {
      $addToSet: {
        [voteListField]: username,
      },
      $inc: {
        [voteCountField]: 1,
      },
    }
  ).exec();
  await User.updateOne({ username }, { $inc: { [voteCountField]: 1 } }).exec();
};

export const getReviews = async input => {
  // Set courseId to null to get the latest reviews
  const { courseId, lecturer, term, sortBy, ascending, page } = input;
  const query = {
    courseId,
    lecturer,
    term,
  };
  Object.keys(query).forEach(
    key => query[key] === undefined && delete query[key]
  );

  return withCache(reviewCache, courseId ? courseId : 'latest', async () => {
    return await Review.find(courseId && query, null, {
      skip: page * REVIEWS_PER_PAGE,
      limit: REVIEWS_PER_PAGE,
      sort: {
        [sortBy]: ascending ? 1 : -1,
      },
    }).exec();
  });
};

export const editReview = async input => {
  const { courseId, username, ...newReview } = input;
  await Review.updateOne(
    {
      courseId,
      username,
    },
    newReview
  ).exec();
};
