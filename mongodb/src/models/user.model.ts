import { Schema, model } from 'mongoose';
import { User } from 'cutopia-types/lib/types';
import { requiredString, createdAt } from '../schemas';

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    SID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: requiredString,
    createdAt: createdAt,
    reviewIds: [String], // format: courseId#createdAt
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    resetPwdCode: String,
    exp: {
      type: Number,
      default: 0,
    },
    veriCode: String,
    verified: {
      type: Boolean,
      default: false,
    },
    timetableId: {
      type: String,
      default: null,
    },
    timetables: [
      {
        type: String,
        ref: 'Timetable',
      },
    ],
  },
  {
    toJSON: { virtuals: true, getters: true },
  }
);

// to be removed when viewsCount is implemented
userSchema.virtual('fullAccess').get(function () {
  return this.reviewIds.length > 0;
});

const UserModal = model<User>('User', userSchema);

export default UserModal;
