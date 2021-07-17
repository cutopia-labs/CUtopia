export enum LoginPageMode {
  CUSIS,
  CUTOPIA_LOGIN,
  CUTOPIA_SIGNUP,
  VERIFY,
  RESET_PASSWORD,
  RESET_PASSWORD_VERIFY,
}

export enum CheckUserExistCode {
  USERNAME_EMAIL_AVAILABLE,
  USERNAME_EXIST,
  EMAIL_EXIST,
}

export enum LoginState {
  LOGGED_OUT,
  LOGGED_IN_CUSIS,
  LOGGED_IN_CUTOPIA,
}

export enum VerificationCode {
  SUCCEEDED,
  FAILED,
  ALREADY_VERIFIED,
  USER_DNE,
}

export enum LoginCode {
  SUCCEEDED,
  FAILED,
  USER_DNE,
}
