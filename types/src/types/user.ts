import { Timetable } from './timetable';

export type UserVisible = {
  username: string;
  verified: boolean;
  reviewIds: string[];
  upvotes: number;
  exp: number;
  level: number;
  timetableId: string;
  timetables: Timetable[];
  fullAccess?: boolean;
};

export type User = UserVisible & {
  SID: string;
  password: string;
  resetPwdCode: string;
  createdAt: number;
  downvotes: number;
  veriCode: string;
  sharedTimetables: Timetable[];
};

export type LoginResult = {
  token?: string;
  me?: User;
};
