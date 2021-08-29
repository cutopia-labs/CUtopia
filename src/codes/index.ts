// used across different AWS services
export enum ErrorCode {
  AUTHORIZATION_REQUIRES_LOGIN,
  AUTHORIZATION_REQUIRES_OWNER,
  CREATE_USER_INVALID_EMAIL,
  CREATE_USER_USERNAME_EXISTS,
  CREATE_USER_EMAIL_EXISTS,
  VERIFICATION_FAILED,
  VERIFICATION_ALREADY_VERIFIED,
  VERIFICATION_USER_DNE,
  VERIFICATION_EXPIRED,
  LOGIN_FAILED,
  LOGIN_USER_DNE,
  LOGIN_NOT_VERIFIED,
  GET_PASSWORD_USER_DNE,
  GET_PASSWORD_NOT_VERIFIED,
  RESET_PASSWORD_FAILED,
  RESET_PASSWORD_USER_DNE,
  RESET_PASSWORD_NOT_VERIFIED,
  CREATE_REVIEW_ALREADY_CREATED,
  VOTE_REVIEW_INVALID_VALUE,
  VOTE_REVIEW_VOTED_ALREADY,
  VOTE_REVIEW_DNE,
  GET_REVIEW_INVALID_SORTING,
  GET_TIMETABLE_INVALID_ID,
  GET_TIMETABLE_UNAUTHORIZED,
  GET_TIMETABLE_EXPIRED,
  DEL_TIMETABLE_INVALID_ID,
  INPUT_INVALID_LENGTH,
  INPUT_INVALID_VALUE,
}

export enum ReportCategory {
  ERROR,
  FEEDBACK,
  COURSE,
  REVIEW,
}

export enum ReviewReportType {
  OTHER,
  HATE_SPEECH,
  PERSONAL_ATTACK,
  SPAM,
  MISLEADING,
}

export enum CourseReportType {
  OTHER,
  COURSE_TITLE,
  CREDITS,
  ASSESSMENTS,
  REQUIREMENTS,
  DESCRIPTION,
}

export enum VoteAction {
  DOWNVOTE,
  UPVOTE,
}
