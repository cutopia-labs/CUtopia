import { CourseSection } from './courses';

export type CourseTableEntry = {
  courseId: string;
  title: string;
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
