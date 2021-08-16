import { Schema, model } from 'mongoose';
import { requiredString, createdAt } from '../schemas';
import { Timetable } from './timetable.model';

type Review = {
  courseId: string;
  createdAt: number;
  sem: string;
};

type User = {
  username: string;
  SID: string;
  password: string;
  resetPwdCode: string;
  email: string;
  createdAt: number;
  reviews: Review[];
  exp: number;
  veriCode: string;
  verified: boolean;
  fullAccess: boolean;
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
  reviews: [
    {
      courseId: String,
      createdAt: String,
      sem: String,
    },
  ],
  resetPwdCode: String,
  exp: Number,
  veriCode: String,
  verified: Boolean,
  fullAccess: Boolean,
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
