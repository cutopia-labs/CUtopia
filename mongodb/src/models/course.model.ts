import mongoose from 'mongoose';
import { requiredNumber, requiredString } from '../schemas';

const Schema = mongoose.Schema;

type Course = {
  lecturers: string[];
  terms: string[];
  rating: {
    numReviews: number;
    overall: number;
    grading: number;
    content: number;
    difficulty: number;
    teaching: number;
  };
};

const courseRatingSchema = {
  type: Number,
  required: true,
  default: 0,
  min: 0,
};

const courseSchema = new Schema<Course>(
  {
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
  }
);

const CourseModal = mongoose.model<Course>('Course', courseSchema);

export default CourseModal;
