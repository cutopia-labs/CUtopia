import NodeCache from 'node-cache';
import { ErrorCode, VoteAction } from 'cutopia-types/lib/codes';

import Review from '../models/review.model';
import User from '../models/user.model';
import withCache from '../utils/withCache';
import { updateCourseData } from './course';
import { REVIEWS_PER_PAGE } from '../constant/configs';

const generateReviewId = (courseId: string, createdAt: number | string) =>
  `${courseId}#${createdAt}`;

const reviewCache = new NodeCache({
  stdTTL: 1800,
});

export const createReview = async input => {
  const { username, courseId, ...reviewData } = input;
  const createdAt = +new Date();
  const _id = generateReviewId(courseId, createdAt);
  const user = await User.findOne({ username }, 'reviewIds exp').exec();
  if (user.reviewIds.some(reviewId => reviewId.startsWith(courseId))) {
    throw Error(ErrorCode.CREATE_REVIEW_ALREADY_CREATED.toString());
  }
  // give extra exp for writing the first review
  user.exp += user.reviewIds.length === 0 ? 5 : 3;
  user.reviewIds.push(_id);

  const newReview = new Review({
    username,
    courseId,
    _id,
    ...reviewData,
  });

  await user.save();
  await newReview.save();
  await updateCourseData(courseId, reviewData);

  return {
    id: _id,
    createdAt,
  };
};

export const getReview = async input =>
  withCache(reviewCache, `${input.courseId}_${input.createdAt}`, async () => {
    return await Review.findById(
      generateReviewId(input.courseId, input.createdAt)
    ).exec();
  });

export const voteReview = async input => {
  const { id, username, vote } = input;
  if (vote !== VoteAction.UPVOTE && vote !== VoteAction.DOWNVOTE) {
    throw Error(ErrorCode.VOTE_REVIEW_INVALID_VALUE.toString());
  }
  const isUpvote = vote === VoteAction.UPVOTE;
  const voteListField = isUpvote ? 'upvoteUserIds' : 'downvoteUserIds';
  const voteCountField = isUpvote ? 'upvotes' : 'downvotes';

  const review = await Review.findById(
    { _id: id },
    `upvoteUserIds downvoteUserIds ${voteCountField} username`
  ).exec();
  if (!review) {
    throw Error(ErrorCode.VOTE_REVIEW_DNE.toString());
  }
  if (
    review.upvoteUserIds.includes(username) ||
    review.downvoteUserIds.includes(username)
  ) {
    throw Error(ErrorCode.VOTE_REVIEW_VOTED_ALREADY.toString());
  }
  review[voteListField].push(username);
  review[voteCountField] += 1;
  await review.save();

  await User.updateOne(
    { username: review.username },
    { $inc: { [voteCountField]: 1 } }
  ).exec();
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
  const oldReview = await Review.findOneAndUpdate(
    { courseId, username },
    newReview
  ).exec();
  await updateCourseData(courseId, newReview, oldReview);
};
