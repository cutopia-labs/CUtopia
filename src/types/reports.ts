import { CourseInfoReportMode, ReviewReportMode } from './enums';

type Report<T> = {
  type: T;
  description: string;
};

export type ReviewReport = Report<ReviewReportMode>;

export type CourseInfoReport = Report<CourseInfoReportMode>;
