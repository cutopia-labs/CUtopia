import { CourseDocument } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { requiredNumber, requiredString } from '../schemas';

const courseRatingSchema = {
  type: Number,
  required: true,
  default: 0,
  min: 0,
};

const courseSchema = new Schema<CourseDocument>(
  {
    _id: requiredString,
    lecturers: {
      type: [String],
      required: true,
    },
    terms: {
      type: [String],
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
