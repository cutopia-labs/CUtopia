import { CourseDocument } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { requiredNumber, requiredString } from '../schemas';

const courseRatingSchema = {
  type: Number,
  required: true,
  default: 0,
  min: 0,
};

// temporarily remove type due to: https://github.com/Automattic/mongoose/issues/10623
const courseSchema = new Schema(
  {
    _id: requiredString,
    lecturers: {
      type: [requiredString],
      required: true,
    },
    terms: {
      type: [requiredString],
      required: true,
    },
    rating: {
      numReviews: requiredNumber,
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
    _id: false,
  }
);

const CourseModal = model<CourseDocument>('Course', courseSchema);

export default CourseModal;
