import {
  CourseReportType,
  ReportCategory,
  ReviewReportType,
} from 'cutopia-types/lib/codes';

export const REPORT_ISSUES_MESSAGES = {
  [ReportCategory.COURSE]: `Inaccurate course info for `,
  [ReportCategory.REVIEW]: `Inappropriate review`,
};

export const REPORT_MODES = {
  [ReportCategory.COURSE]: {
    [CourseReportType.COURSE_TITLE]: 'title',
    [CourseReportType.CREDITS]: 'credits',
    [CourseReportType.ASSESSMENTS]: 'assessments',
    [CourseReportType.REQUIREMENTS]: 'requirements',
    [CourseReportType.DESCRIPTION]: 'description',
    [CourseReportType.OTHER]: 'other',
  },
  [ReportCategory.REVIEW]: {
    [ReviewReportType.HATE_SPEECH]: 'hate speech',
    [ReviewReportType.PERSONAL_ATTACK]: 'personal attack',
    [ReviewReportType.SPAM]: 'spam',
    [ReviewReportType.MISLEADING]: 'misleading',
    [ReviewReportType.OTHER]: 'other',
  },
};
