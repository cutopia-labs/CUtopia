const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ratingSchema = {
  type: Number,
  required: true,
  min: 0,
  max: 4
};

const reviewDetailSchema = new Schema({
  grade: ratingSchema,
  text: {
    type: String,
    required: true,
    maxlength: 500
  }
}, {
  _id: false
});

const reviewSchema = new Schema(
  {
    username: {
      type: String, required: true
    },
    reviewId: {
      type: String, required: true
    },
    courseId: {
      type: String, reqiored: true
    },
    term: {
      type: String, required: true
    },
    lecturer: {
      type: String, required: true
    },
    anonymous: {
      type: Boolean, required: true
    },
    upvotes: {
      type: Number
    },
    downvotes: {
      type: Number
    },
    _id: {
      type: Number,
      default: Date.now
    },
    upvoteUserIds: [{
      type: String
    }],
    downvoteUserIds: [{
      type: String
    }],
    overall: ratingSchema,
    grading: reviewDetailSchema,
    teaching: reviewDetailSchema,
    difficulty: reviewDetailSchema,
    content: reviewDetailSchema
  },
  {
    timestamps: false
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
