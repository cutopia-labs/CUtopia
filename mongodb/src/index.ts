import mongoose from 'mongoose';
import {
  createUser,
  verifyUser,
  login,
  getResetPasswordCodeAndEmail,
  resetPassword,
} from './controllers';

export {
  getCourseData,
  updateCourseDataFromReview,
  createReview,
  getReviews,
  getSharedTimetable,
  shareTimetable,
  createUser,
  verifyUser,
  login,
  getResetPasswordCodeAndEmail,
  resetPassword,
  incrementUpvotesCount,
  updateSharedTimetableId,
  report,
  rankCourses,
  getRanking,
} from './controllers';

require('dotenv').config();

// https://docs.atlas.mongodb.com/best-practices-connecting-from-aws-lambda/

let conn = null;

export const connect = async uri => {
  console.log(`Try to connect with ${uri}`);
  if (conn === null) {
    conn = mongoose.connect(uri).then(() => mongoose);
    await conn;
  }
  console.log('MongoDB database connection established successfully');
  return conn;
};

/*
// TODO: unit testing
connect(process.env.ATLAS_URI).then(async conn => {
  try {
    const veriCode = await createUser({
      username: 'test',
      password: '1234',
      SID: '1155000000',
    });
    console.log('Created user');

    await verifyUser({
      username: 'test',
      code: veriCode,
    });
    console.log('Verified user');

    await login({
      username: 'test',
      password: '1234',
    });
    console.log('Logged in');

    const { code: resetCode, email } = await getResetPasswordCodeAndEmail({
      username: 'test',
    });
    console.log('Generated reset password');

    await resetPassword({
      username: 'test',
      newPassword: '5678',
      resetCode,
    });
    console.log('Resetted password');
  } catch (e) {
    console.trace(e);
  } finally {
    mongoose.connection.close();
  }
});
*/
