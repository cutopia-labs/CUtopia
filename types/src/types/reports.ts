import { CourseReportType, ReviewReportType } from '../codes';

type Report<T> = {
  type: T;
  description: string;
};

export type ReviewReport = Report<ReviewReportType>;

export type CourseInfoReport = Report<CourseReportType>;

export type ReportDocument = {
  _id: string;
  createdAt: number;
  cat: number;
  username: string;
  description: string;
  types?: number[];
  identifier?: string;
};
