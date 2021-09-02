import { Events } from './events';

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

export interface Course {
  subject: Subject;
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
  terms?: Term[];
  assessments?: AssessementComponent[];
  rating?: CourseRating;
  reviewLecturers?: string[];
  reviewTerms?: string[]; //temp
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
  shareId?: string;
  key: number; // timestamp
  courses: PlannerCourse[];
};

export type TimetableInfo = {
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
