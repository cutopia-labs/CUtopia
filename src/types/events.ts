import { CourseSection } from './courses';

type User = {
  timetable?: CourseTableEntry[];
};

type CourseTableEntry = {
  courseId: string;
  title: string;
  sections?: CourseSection[];
};

export type { User, CourseTableEntry };
