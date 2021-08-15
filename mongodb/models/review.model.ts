import mongoose from 'mongoose';
import { ratingSchema } from '../schemas';

const Schema = mongoose.Schema;

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
    username: { type: String, required: true },
    reviewId: { type: String, required: true },
    courseId: { type: String, required: true },
    term: { type: String, required: true },
    lecturer: { type: String, required: true },
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
  }
);
reviewSchema.index({ courseId: 1, createdDate: -1 }, { unique: true });

const ReviewModal = mongoose.model<Review>('Review', reviewSchema);

export default ReviewModal;
