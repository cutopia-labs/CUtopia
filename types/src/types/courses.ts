import { Events } from './events';

export interface CourseDataRaw {
  code: string;
  title: string;
  career: string;
  units: string;
  grading: string;
  components: string;
  campus: string;
  academic_group: string;
  requirements: string;
  description: string;
  outcome: string;
  syllabus: string;
  required_readings: string;
  recommended_readings: string;
  assessments?: AssessementComponent[];
}

export interface Course extends CourseDataRaw {
  courseId: string;
  rating?: CourseRating;
  reviewLecturers?: string[];
  reviewTerms?: string[];
}

export interface CourseInfo extends Course {
  courseId: string;
}

export type CourseRating = {
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};

export type Term = {
  name: string;
  course_sections?: [CourseSection];
};

export type PlannerCourse = {
  courseId: string;
  title: string;
  credits: number;
  sections: {
    [sectionName: string]: CourseSection;
  };
};

export type Planner = {
  label?: string;
  key: number; // timestamp
  courses: PlannerCourse[];
};

export type TimeTableInfo = {
  totalCredits: number;
  averageHour: number;
  weekdayAverageHour: Record<string, number>;
};

export interface CourseSection extends Events {
  name: string;
  instructors: string[];
  hide?: boolean;
}

export type AssessementComponent = {
  name: string;
  percentage: string;
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

export type CourseDocument = {
  _id: string;
  lecturers: string[];
  terms: string[];
  rating: {
    numReviews: number;
    overall: number;
    grading: number;
    content: number;
    difficulty: number;
    teaching: number;
  };
};
