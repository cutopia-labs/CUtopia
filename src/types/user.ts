import { CourseTableEntry } from './events';

type User = {
  username: string;
  email: string;
  verified: boolean;
  reviewIds: string[];
  upvotesCount: number;
  timetable?: CourseTableEntry[];
};

type CreateUserResult = {
  error?: string;
};

type VerifyUserResult = {
  code: number;
};

type UpdateUserResult = {
  error?: string;
};

type LoginResult = {
  code: number;
  token?: string;
  me?: User;
};

type SendResetPasswordCodeResult = {
  code?: number;
  error?: string;
};

type ResetPasswordResult = {
  code?: number;
  error?: string;
};

export type {
  User,
  CreateUserResult,
  VerifyUserResult,
  UpdateUserResult,
  LoginResult,
  SendResetPasswordCodeResult,
  ResetPasswordResult,
};
