const {
  createReview,
  getCourseRating,
  getReviews
} = require('./controllers/review');
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.ATLAS_URI;
let conn = null;

exports.connect = async () => {
  if (conn === null) {
    conn = mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => mongoose);
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
  getReviews
});
