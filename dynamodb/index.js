const {
  createReview,
  getReviews,
  getReview,
  voteReview,
  VOTE_ACTIONS,
} = require('./databases/reviews-db');
const {
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login,
  LOGIN_CODES,
  VERIFICATION_CODES,
  GET_PASSWORD_CODE_CODES,
  RESET_PASSWORD_CODES,
} = require('./databases/user-db');

module.exports = {
  createReview,
  getReviews,
  getReview,
  voteReview,
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login,
  VOTE_ACTIONS,
  LOGIN_CODES,
  VERIFICATION_CODES,
  GET_PASSWORD_CODE_CODES,
  RESET_PASSWORD_CODES,
};
