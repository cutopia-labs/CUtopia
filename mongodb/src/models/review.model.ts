import { Review, ReviewDetail } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { ratingSchema, requiredString } from '../schemas';

const reviewDetailSchema = new Schema<ReviewDetail>(
  {
    grade: ratingSchema,
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

// temporarily remove type due to: https://github.com/Automattic/mongoose/issues/10623
const reviewSchema = new Schema(
  {
    _id: requiredString,
    courseId: requiredString, // dummy for filtering
    username: requiredString,
    title: String,
    term: requiredString,
    lecturer: requiredString,
    anonymous: { type: Boolean, required: true },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    upvoteUserIds: [String],
    downvoteUserIds: [String],
    overall: ratingSchema,
    grading: reviewDetailSchema,
    teaching: reviewDetailSchema,
    difficulty: reviewDetailSchema,
    content: reviewDetailSchema,
  },
  {
    timestamps: {
      currentTime: () => +new Date(),
      createdAt: false,
      updatedAt: true,
    },
    _id: false,
    toJSON: { virtuals: true }, // to store virtuals in cache
  }
);
reviewSchema.index({ _id: -1 }, { unique: true });
reviewSchema.virtual('id').get(function () {
  return this._id;
});
reviewSchema.virtual('createdAt').get(function () {
  return this._id.split('#')[1];
});

const ReviewModal = model<Review>('Review', reviewSchema);

export default ReviewModal;
