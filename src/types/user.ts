import { TimetableOverview } from './events';

type User = {
  username: string;
  verified: boolean;
  reviewIds: string[];
  upvotes: number;
  exp: number;
  level: number;
  timetableId: string;
  email?: string;
  timetables?: TimetableOverview[][];
  fullAccess?: boolean;
};

type UserData = {
  me: User;
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
  UserData,
  CreateUserResult,
  VerifyUserResult,
  UpdateUserResult,
  LoginResult,
  SendResetPasswordCodeResult,
  ResetPasswordResult,
};
