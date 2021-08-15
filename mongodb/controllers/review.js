const { nanoid } = require('nanoid');
const { courseRating } = require('../pipelines/reviews');
const Review = require('../models/review.model');
const Course = require('../models/course.model');
const { updateCourseDataFromReview } = require('./course');

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
    ...reviewData,
  });
  // Update User
  try {
    await newReview.save();
    await updateCourseDataFromReview(courseId, reviewData);
    return {
      id: reviewId,
      createdDate: now,
    };
  } catch (e) {
    console.trace(e);
  }
};

exports.getCourseRating = async input => {
  const { courseId } = input;
  try {
    const rating = await Review.aggregate(courseRating(courseId));
    return rating[0];
  } catch (e) {
    console.trace(e);
  }
};

/*
"filter": {
  "lecturer": "Raymond CHUI",
  "term": "2020 - 21 Term 1"
},
"sorting": {
  "upvotes": -1
}
*/

exports.getReviews = async (filter, sort) => {
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
