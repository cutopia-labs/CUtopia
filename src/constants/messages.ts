import {
  CourseReportType,
  IssueReportType,
  ReportCategory,
  ReviewReportType,
} from 'cutopia-types/lib/codes';

export const REPORT_ISSUES_MESSAGES = {
  [ReportCategory.ISSUE]: 'Describe your issue',
  [ReportCategory.COURSE]: `Inaccurate course info for `,
  [ReportCategory.REVIEW]: `Inappropriate review`,
};

export const REPORT_MODES = {
  [ReportCategory.ISSUE]: {
    [IssueReportType.UI]: 'UI',
    [IssueReportType.BUGS]: 'bugs',
    [IssueReportType.FEATURES]: 'features',
    [IssueReportType.EXPERIENCE]: 'experiences',
  },
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
