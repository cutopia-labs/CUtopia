import { CourseSection } from './courses';

export type CourseTableEntry = {
  courseId: string;
  title: string;
  sections?: CourseSection[];
};

export type ShareTimeTable = {
  id: string;
  token: string;
};
