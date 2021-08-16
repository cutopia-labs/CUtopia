import { Schema, model } from 'mongoose';
import { requiredString } from '../schemas';

type Review = {
  courseId: string;
  createdDate: number;
  sem: string;
};

type User = {
  username: string;
  SID: string;
  password: string;
  resetPwdCode: string;
  email: string;
  createdDate: number;
  reviews: Review[];
  exp: number;
  veriCode: string;
  verified: boolean;
  fullAccess: boolean;
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
  createdDate: { type: Date, required: true },
  reviews: [
    {
      courseId: String,
      createdDate: String,
      sem: String,
    },
  ],
  resetPwdCode: String,
  exp: Number,
  veriCode: String,
  verified: Boolean,
  fullAccess: Boolean,
});
userSchema.virtual('level').get(function () {
  return this.exp % 5;
});
userSchema.virtual('email').get(function () {
  return `${this.SID}@link.cuhk.edu.hk`;
});

const UserModal = model<User>('User', userSchema);

export default UserModal;
