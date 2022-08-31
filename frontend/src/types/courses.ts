import {
  CourseDataRaw,
  CourseRating,
  Term,
  PlannerRaw,
  CourseSection,
} from 'cutopia-types';
import { TimetableOverviewMode } from './enums';
import { TbaSections } from './events';

export type Subject = {
  name: string;
  courses: CourseWithRating[];
};

export interface CourseWithRating extends CourseDataRaw {
  subject: Subject;
  terms?: Term[];
  rating?: CourseRating;
  reviewLecturers?: string[];
  reviewTerms?: string[];
}

export interface CourseInfo extends CourseWithRating {
  courseId: string;
  sections?: CourseSection[]; // For planner use
}

export interface Planner extends PlannerRaw {
  type?: TimetableOverviewMode;
}

export type TimetableInfo = {
  totalCredits: number;
  averageHour: number;
  weekdayAverageHour: Record<string, number>;
  tbaSections: TbaSections;
};

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
