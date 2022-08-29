import {
  CourseReportType,
  IssueReportType,
  ReportCategory,
  ReviewReportType,
} from 'cutopia-types';

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
    [IssueReportType.COURSE_INFO]: 'courses',
    [IssueReportType.OTHER]: 'other',
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

export const WINDOW_LEAVE_MESSAGES = {
  REVIEW_EDIT:
    'Are you sure you want to leave? (Review will be saved as draft)',
};
