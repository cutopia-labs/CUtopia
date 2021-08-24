import mongoose from 'mongoose';

export {
  getUser,
  updateUser,
  getCourseData,
  updateCourseDataFromReview,
  createReview,
  getReviews,
  getReview,
  editReview,
  voteReview,
  getTimetablesOverview,
  getTimetable,
  uploadTimetable,
  removeTimetable,
  cleanExpiredTimetable,
  createUser,
  verifyUser,
  login,
  getResetPasswordCodeAndEmail,
  resetPassword,
  incrementUpvotesCount,
  updateTimetableId,
  report,
  rankCourses,
  getRanking,
  sendDiscussionMessage,
  getDiscussion,
} from './controllers';

require('dotenv').config();

// https://docs.atlas.mongodb.com/best-practices-connecting-from-aws-lambda/#connection-examples
let conn = null;

export const connect = async (uri: string) => {
  if (conn === null) {
    console.log(`Try connecting to ${uri}`);
    conn = mongoose.connect(uri).then(() => mongoose);
    await conn;
    console.log('Connected to MongoDB successfully');
  }
  return conn;
};
