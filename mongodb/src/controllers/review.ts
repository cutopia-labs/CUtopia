import { nanoid } from 'nanoid';
import { ErrorCode } from 'cutopia-types/lib/codes';

import Review from '../models/review.model';
import User from '../models/user.model';
import { updateCourseDataFromReview } from './course';

export const createReview = async input => {
  const now = new Date().getTime().toString();
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
    modifiedDate: now,
    upvotes: 0,
    upvotesUserIds: [],
    downvotes: 0,
    downvotesUserIds: [],
    ...reviewData,
  });

  await user.save();
  await newReview.save();
  await updateCourseDataFromReview(courseId, reviewData);

  return {
    id: reviewId,
    createdDate: now,
  };
};

export const getReviews = async (filter, sort) => {
  try {
    const rating = await Review.aggregate(
      [
        {
          $match: filter,
        },
        sort && {
          $sort: sort,
        },
      ].filter(item => item)
    );
    return rating;
  } catch (e) {
    console.trace(e);
  }
};
