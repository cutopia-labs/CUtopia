const {
  createReview,
  getCourseRating,
  getReviews,
} = require('./controllers/review');
const { getCourseData } = require('./controllers/course');
const mongoose = require('mongoose');
require('dotenv').config();

let conn = null;

exports.connect = async uri => {
  console.log(`Try to connect with ${uri}`);
  if (conn === null) {
    conn = mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      .then(() => mongoose);
    await conn;
  }
  console.log('MongoDB database connection established successfully');
  return conn;
};

/*
https://docs.atlas.mongodb.com/best-practices-connecting-from-aws-lambda/#std-label-lambda-aws-example
https://docs.atlas.mongodb.com/best-practices-connecting-from-aws-lambda/
*/

module.exports = Object.assign(module.exports, {
  createReview,
  getCourseRating,
  getReviews,
  getCourseData,
});
