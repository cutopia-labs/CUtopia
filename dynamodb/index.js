const { createReview, getReviews, voteReview } = require('./databases/reviews-db');

module.exports = {
  createReview,
  getReviews,
  voteReview,
};
