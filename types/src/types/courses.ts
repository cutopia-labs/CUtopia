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

export type PlannerRaw = {
  tableName?: string;
  createdAt?: number;
  courses: PlannerCourse[];
  expire?: number;
  expireAt?: number;
  id: string;
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
