import { CourseSection } from './courses';

type CourseTableEntry = {
  courseId: string;
  title: string;
  sections?: CourseSection[];
};

export type { CourseTableEntry };
