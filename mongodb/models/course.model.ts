import mongoose from 'mongoose';

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

const CourseModal = mongoose.model<Course>('Course', courseSchema);

export default CourseModal;
