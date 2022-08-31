import { UserVisible } from 'cutopia-types';
import { TimetableOverview } from './events';

export type User = UserVisible & {
  timetables?: TimetableOverview[];
};

export type UserData = {
  me: User;
};
