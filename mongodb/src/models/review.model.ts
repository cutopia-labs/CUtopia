import { Schema, model } from 'mongoose';
import { ratingSchema, requiredString } from '../schemas';

type ReviewDetailSchema = {
  grade: number;
  text: string;
};

type Review = {
  username: string;
  reviewId: string;
  courseId: string;
  term: string;
  lecturer: string;
  anonymous: boolean;
  upvotes: number;
  downvotes: number;
  upvoteUserIds: string[];
  downvoteUserIds: string[];
  overall: number;
  grading: ReviewDetailSchema;
  teaching: ReviewDetailSchema;
  difficulty: ReviewDetailSchema;
  content: ReviewDetailSchema;
  createdAt: number;
  updatedAt: number;
};

const reviewDetailSchema = new Schema<ReviewDetailSchema>({
  grade: ratingSchema,
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
});

const reviewSchema = new Schema<Review>(
  {
    username: requiredString,
    reviewId: requiredString,
    courseId: requiredString,
    term: requiredString,
    lecturer: requiredString,
    anonymous: { type: Boolean, required: true },
    upvotes: Number,
    downvotes: Number,
    upvoteUserIds: [String],
    downvoteUserIds: [String],
    overall: ratingSchema,
    grading: reviewDetailSchema,
    teaching: reviewDetailSchema,
    difficulty: reviewDetailSchema,
    content: reviewDetailSchema,
  },
  { timestamps: { currentTime: Date.now } }
);
reviewSchema.index({ courseId: 1, createdAt: -1 }, { unique: true });

const ReviewModal = model<Review>('Review', reviewSchema);

export default ReviewModal;
