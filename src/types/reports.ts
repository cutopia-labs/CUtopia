import { CourseReportType, ReviewReportType } from '../codes';

type Report<T> = {
  type: T;
  description: string;
};

export type ReviewReport = Report<ReviewReportType>;

export type CourseInfoReport = Report<CourseReportType>;
