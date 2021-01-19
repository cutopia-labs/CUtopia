const { createReview, getReviews, voteReview } = require('./databases/reviews-db');
const { createUser, verifyUser } = require('./databases/user-db');

module.exports = {
  createReview,
  getReviews,
  voteReview,
  createUser,
  verifyUser,
};
