const { nanoid } = require('nanoid');
const Review = require('../models/review.model');

exports.createReview = async (input, user) => {
  const now = new Date().getTime().toString();
  const { courseId, ...reviewData } = input;
  const reviewId = nanoid(10);
  const { username } = user;

  const newReview = new Review({
    username: username,
    courseId: courseId,
    reviewId: reviewId,
    modifiedDate: now,
    _id: now,
    upvotes: 0,
    upvotesUserIds: [],
    downvotes: 0,
    downvotesUserIds: [],
    ...reviewData
  });

  // Update User

  try {
    await newReview.save();
    return {
      id: reviewId,
      createdDate: now
    };
  } catch (e) {
    console.trace(e);
  }
};

exports.getCourseRating = async (input) => {
  const { courseId } = input;
  try {
    const rating = await Review
      .aggregate([
        {
          $match: {
            courseId
          }
        },
        {
          $group: {
            _id: '$courseId',
            overall: {
              $avg: '$overall'
            },
            grading: {
              $avg: '$grading.grade'
            },
            teaching: {
              $avg: '$teaching.grade'
            },
            difficulty: {
              $avg: '$difficulty.grade'
            },
            content: {
              $avg: '$content.grade'
            }
          }
        }
      ]);
    return rating[0];
  } catch (e) {
    console.trace(e);
  }
};
