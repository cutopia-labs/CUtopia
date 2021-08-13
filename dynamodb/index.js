const {
  createReview,
  editReview,
  getReviews,
  getReview,
  voteReview
} = require('./databases/reviews-db');

const {
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login
} = require('./databases/user-db');

const {
  addCourseData,
  getCourseData
} = require('./databases/course-db');

const {
  getTimetable,
  addTimetable,
  removeTimetable,
  shareTimetable,
  getSharedTimetable,
  deleteSharedTimetable
} = require('./databases/timetable-db');

const {
  report,
  reportFeedback
} = require('./databases/report-db');

module.exports = {
  createReview,
  editReview,
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
  addCourseData,
  getCourseData,
  getTimetable,
  addTimetable,
  removeTimetable,
  shareTimetable,
  getSharedTimetable,
  deleteSharedTimetable,
  report,
  reportFeedback
};
