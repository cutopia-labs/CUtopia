import { Review } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';

import { requiredNumber, requiredString } from '../constants/schema';

const rating = {
  type: Number,
  required: true,
  min: 0,
  max: 4,
};

const reviewDetail = {
  grade: rating,
  text: {
    type: String,
    required: true,
    maxlength: 10000,
  },
};

const reviewSchema = new Schema<Review>(
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
    overall: rating,
    grading: reviewDetail,
    teaching: reviewDetail,
    difficulty: reviewDetail,
    content: reviewDetail,
    createdAt: requiredNumber, // cannot in second, as this shall be the same as the one in id
    updatedAt: requiredNumber,
  },
  {
    // not sure updateAt gonna trigger when updates changed, better manually change when editReview
    timestamps: false,
    _id: false,
    toJSON: { virtuals: true, getters: true }, // to store virtuals in cache
  }
);
// By default, MongoDB creates a unique index on the _id field during the creation of a collection.
reviewSchema.index({ createdAt: -1 });

const ReviewModel = model<Review>('Review', reviewSchema);

export default ReviewModel;
