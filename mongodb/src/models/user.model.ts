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
    fullAccess: {
      type: Boolean,
      default: false,
    },
    timetables: [
      {
        type: String,
        ref: 'Timetable',
      },
    ],
    sharedTimetables: [
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
userSchema.virtual('level').get(function () {
  return this.exp % 5;
});
userSchema.virtual('email').get(function () {
  return `${this.SID}@link.cuhk.edu.hk`;
});

const UserModal = model<User>('User', userSchema);

export default UserModal;
