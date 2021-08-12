import { CourseSection } from './courses';

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
  credit: string;
  sections?: CourseSection[];
};

export type ShareTimeTableResponse = {
  id: string;
};

export type ShareTimeTable = {
  entries: CourseTableEntry[];
  tableName?: string;
  createdDate: number;
  expireDate: number;
};

export type OverlapSection = {
  name: string;
  courseIndex: number;
  sectionKey: string;
};

export type OverlapSections = {
  [key: string]: OverlapSection;
};
