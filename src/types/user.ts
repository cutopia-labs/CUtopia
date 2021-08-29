import { Timetable } from './timetable';

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
  viewsCount: number;
  discussions: string[];
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
