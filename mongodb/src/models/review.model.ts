import { Review, ReviewDetail } from 'cutopia-types/lib/types';
import { Schema, model, set } from 'mongoose';
import {
  ratingSchema,
  requiredNumber,
  requiredString,
  unixTimestampInSeconds,
} from '../schemas';

const reviewDetailSchema = new Schema<ReviewDetail>(
  {
    grade: ratingSchema,
    text: {
      type: String,
      required: true,
      maxlength: 10000,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

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
    overall: ratingSchema,
    grading: reviewDetailSchema,
    teaching: reviewDetailSchema,
    difficulty: reviewDetailSchema,
    content: reviewDetailSchema,
    createdAt: requiredNumber, // cannot in second, as this shall be the same as the one in id
    updatedAt: unixTimestampInSeconds,
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

/* DEBUG ONLY
set('debug', true);
ReviewModel.on('index', err => {
  console.error(err);
});
*/

export default ReviewModel;
