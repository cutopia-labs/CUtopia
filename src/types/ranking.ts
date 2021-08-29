import { Course } from './courses';

export type RankEntry = {
  _id: string; // courseId
  val: any;
};

export type Ranking = {
  _id: string; // ranking field, e.g. latest, grading
  ranks: RankEntry[];
  updatedAt: number;
};

export type RankTable = {
  popularCourses: PopularCourse[];
  topRatedCourses: TopRatedCourse[];
  topRatedAcademicGroups: TopRatedAcademicGroups[];
};

export type PopularCourse = {
  courseId: string;
  course: Course;
  numReviews: number;
};

export type TopRatedCourse = {
  courseId: string;
  course: Course;
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};

export type TopRatedAcademicGroups = {
  name: string;
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};
