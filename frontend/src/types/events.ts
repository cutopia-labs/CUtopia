import { CourseTableEntry, PlannerCourse } from 'cutopia-types';
import { TimetableOverviewMode } from './enums';

export type UploadTimetableResponse = {
  id: string;
};

export type UploadTimetable = {
  entries: CourseTableEntry[];
  tableName?: string;
  createdAt: number;
  expireAt: number;
  expire?: number;
};

export type OverlapSection = {
  name: string;
  courseIndex: number;
  sectionKey: string;
};

export type OverlapSections = {
  [key: string]: OverlapSection;
};

export type TbaSection = {
  name: string;
  courseIndex: number;
};

export type TbaSections = {
  [key: string]: TbaSection;
};

export interface TimetableOverview {
  _id: string;
  createdAt: number;
  tableName: string | null;
  expireAt?: number;
  expire?: number;
}

export interface TimetableOverviewWithMode extends TimetableOverview {
  mode: TimetableOverviewMode;
}

export type PlannerDelta = {
  tableName?: string;
  courses?: PlannerCourse[];
};
