import { Course } from './courses';

type RankTable = {
  popularCourses: PopularCourse[];
  topRatedCourses: TopRatedCourse[];
  topRatedAcademicGroups: TopRatedAcademicGroups[];
};

type PopularCourse = {
  courseId: string;
  course: Course;
  numReviews: number;
};

type TopRatedCourse = {
  courseId: string;
  course: Course;
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};

type TopRatedAcademicGroups = {
  name: string;
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};

export type {
  RankTable,
  PopularCourse,
  TopRatedCourse,
  TopRatedAcademicGroups,
};
