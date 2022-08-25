import { CourseDocument } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { requiredNumber, requiredString } from '../constants/schema';

const courseRating = {
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
      overall: courseRating,
      grading: courseRating,
      content: courseRating,
      difficulty: courseRating,
      teaching: courseRating,
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
