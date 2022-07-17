import { CourseSection, PlannerCourse } from './courses';
import { TimetableOverviewMode } from './enums';

export interface Event {
  courseId: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
  title?: string;
  location?: string;
  section?: string;
}

export interface Events {
  startTimes: string[];
  endTimes: string[];
  days: number[];
  locations: string[];
}

export type EventConfig = {
  startHour: number;
  endHour: number;
  numOfDays: number;
  numOfHours: number;
};

export type CourseTableEntry = {
  courseId: string;
  title: string;
  credits: number;
  sections?: CourseSection[];
};

export type UploadTimetableResponse = {
  id: string;
};

export type UploadTimetable = {
  entries: CourseTableEntry[];
  tableName?: string;
  createdAt: number;
  expireAt: number;
};

export type OverlapSection = {
  name: string;
  courseIndex: number;
  sectionKey: string;
};

export type OverlapSections = {
  [key: string]: OverlapSection;
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
