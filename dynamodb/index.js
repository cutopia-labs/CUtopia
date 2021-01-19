const { createReview, getReviews, voteReview } = require('./databases/reviews-db');
const { createUser, verifyUser, updateUser, login, LOGIN_CODES, VERIFICATION_CODES } = require('./databases/user-db');

module.exports = {
  createReview,
  getReviews,
  voteReview,
  createUser,
  verifyUser,
  updateUser,
  login,
  LOGIN_CODES,
  VERIFICATION_CODES,
};
