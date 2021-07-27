import { CourseInfoReportMode, ReviewReportMode } from './enums';

type Report<T> = {
  mode: T;
  description: string;
};

export type ReviewReport = Report<ReviewReportMode>;

export type CourseInfoReport = Report<CourseInfoReportMode>;
