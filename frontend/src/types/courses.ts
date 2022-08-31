import {
  CourseDataRaw,
  CourseRating,
  Term,
  PlannerRaw,
  PlannerCourse as PlannerCourseRaw,
  CourseSection as CourseSectionRaw,
  AssessementComponent as AssessementComponentRaw,
} from 'cutopia-types';
import { TimetableOverviewMode } from './enums';
import { TbaSections } from './events';

export type RatingField = 'grading' | 'content' | 'difficulty' | 'teaching';

export type RatingFieldWithOverall =
  | 'overall'
  | 'grading'
  | 'content'
  | 'difficulty'
  | 'teaching';

export type Subject = {
  name: string;
  courses: Course[];
};

export interface Course extends CourseDataRaw {
  subject: Subject;
  terms?: Term[];
  rating?: CourseRating;
  reviewLecturers?: string[];
}

export interface CourseInfo extends Course {
  courseId: string;
  sections?: CourseSectionRaw[]; // For planner use
}

export type PlannerCourse = PlannerCourseRaw;

export interface Planner extends PlannerRaw {
  type?: TimetableOverviewMode;
}

export type CourseSection = CourseSectionRaw;

export type TimetableInfo = {
  totalCredits: number;
  averageHour: number;
  weekdayAverageHour: Record<string, number>;
  tbaSections: TbaSections;
};

export type AssessementComponent = AssessementComponentRaw;

export type DepartmentCourses = {
  [department: string]: CourseSearchItem[];
};

export type CourseSearchItem = {
  c: string;
  t: string;
  o?: number;
};

export type CourseConcise = {
  courseId: string;
  title: string;
};
