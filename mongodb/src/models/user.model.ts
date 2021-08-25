import { Schema, model } from 'mongoose';
import { Timetable } from './timetable.model';
import { requiredString, createdAt } from '../schemas';

type User = {
  username: string;
  SID: string;
  password: string;
  resetPwdCode: string;
  email: string;
  createdAt: number;
  reviewIds: string[];
  upvotes: number;
  downvotes: number;
  exp: number;
  veriCode: string;
  verified: boolean;
  fullAccess: boolean;
  timetables: Timetable[];
  sharedTimetables: Timetable[];
};

const userSchema = new Schema<User>({
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
  upvotes: Number,
  downvotes: Number,
  resetPwdCode: String,
  exp: Number,
  veriCode: String,
  verified: Boolean,
  fullAccess: Boolean,
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
});
userSchema.virtual('level').get(function () {
  return this.exp % 5;
});
userSchema.virtual('email').get(function () {
  return `${this.SID}@link.cuhk.edu.hk`;
});

const UserModal = model<User>('User', userSchema);

export default UserModal;
