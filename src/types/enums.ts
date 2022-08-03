export enum LoginPageMode {
  CUSIS,
  CUTOPIA_LOGIN,
  CUTOPIA_SIGNUP,
  VERIFY,
  RESET_PASSWORD,
  RESET_PASSWORD_SID,
  RESET_PASSWORD_VERIFY,
}

export enum AuthState {
  INIT,
  LOGGED_OUT,
  LOADING,
  LOGGED_IN,
}

export enum ErrorCardMode {
  NULL,
  ERROR,
  NOT_FOUND,
}

export enum TimetableOverviewMode {
  UPLOAD,
  SHARE,
  UPLOAD_SHARABLE,
}

export enum ShareTimetableMode {
  UPLOAD, // user persist timetable / persist sharing ttb
  SHARE,
}

export enum PlannerSyncState {
  DIRTY,
  SYNCING,
  SYNCED,
}
