const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const courseRatingSchema = {
  type: Number,
  required: true,
  default: 0,
  min: 0,
};

const courseSchema = new Schema(
  {
    _id: {
      type: String,
    },
    lecturers: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      required: true,
    },
    terms: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      required: true,
    },
    rating: {
      numReviews: {
        type: Number,
        default: 0,
      },
      overall: courseRatingSchema,
      grading: courseRatingSchema,
      content: courseRatingSchema,
      difficulty: courseRatingSchema,
      teaching: courseRatingSchema,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
