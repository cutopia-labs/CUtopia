import { CourseTableEntry } from "./events";

export enum TimetableOverviewMode {
  NON_EXPIRE,
  NON_EXPIRE_SHARE,
  SHARE,
}

export type ShareTimeTableResponse = {
  id: string;
};

export type ShareTimeTable = {
  entries: CourseTableEntry[];
  tableName?: string;
  createdDate: number;
  expireDate: number;
};


export interface TimetableOverview {
  id: string;
  createdAt: number;
  tableName: string | null;
  expireAt?: number;
  expire?: number;
}

export type Timetable = {
  _id: string;
  createdAt: number;
  entries: any[];
  expire: number;
  expireAt: number;
  tableName?: string;
  username: string;
};
