import {
  CourseInfoReportMode,
  ReportCategory,
  ReviewReportMode,
} from '../types';

export const REPORT_ISSUES_MESSAGES = {
  [ReportCategory.COURSE]: `Inaccurate course info for `,
  [ReportCategory.REVIEW]: `Inappropriate review`,
};

export const REPORT_MODES = {
  [ReportCategory.COURSE]: {
    [CourseInfoReportMode.COURSE_TITLE]: 'title',
    [CourseInfoReportMode.CREDITS]: 'credits',
    [CourseInfoReportMode.ASSESSMENTS]: 'assessments',
    [CourseInfoReportMode.REQUIREMENTS]: 'requirements',
    [CourseInfoReportMode.DESCRIPTION]: 'description',
    [CourseInfoReportMode.OTHER]: 'other',
  },
  [ReportCategory.REVIEW]: {
    [ReviewReportMode.HATE_SPEECH]: 'hate speech',
    [ReviewReportMode.PERSONAL_ATTACK]: 'personal attack',
    [ReviewReportMode.SPAM]: 'spam',
    [ReviewReportMode.MISLEADING]: 'misleading',
    [ReviewReportMode.OTHER]: 'other',
  },
};
