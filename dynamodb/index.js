const { createReview, getReviews, voteReview } = require('./databases/reviews-db');
const { 
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCode,
  resetPassword,
  login,
  LOGIN_CODES,
  VERIFICATION_CODES,
  GET_PASSWORD_CODE_CODES,
  RESET_PASSWORD_CODES
} = require('./databases/user-db');

module.exports = {
  createReview,
  getReviews,
  voteReview,
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCode,
  resetPassword,
  login,
  LOGIN_CODES,
  VERIFICATION_CODES,
  GET_PASSWORD_CODE_CODES,
  RESET_PASSWORD_CODES,
};
