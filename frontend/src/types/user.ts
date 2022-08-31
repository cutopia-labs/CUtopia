import { UserVisible, TimetableOverview } from 'cutopia-types';

export type User = UserVisible & {
  timetables?: TimetableOverview[];
};

export type UserData = {
  me: User;
};
