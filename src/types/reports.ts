import { CourseReportType, ReviewReportType } from 'cutopia-types/lib/codes';

type Report<T> = {
  type: T;
  description: string;
};

export type ReviewReport = Report<ReviewReportType>;

export type CourseInfoReport = Report<CourseReportType>;
