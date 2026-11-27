import { useState, useEffect, FC } from 'react';
import { Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Sentry from '@sentry/nextjs';
import { observer } from 'mobx-react-lite';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import {
  ErrorCode,
  USERNAME_RULE,
  SID_RULE,
  PASSWORD_RULE,
} from 'cutopia-types';

import styles from '../../styles/pages/login.module.scss';
import TextField from '../atoms/TextField';
import { useView, useUser } from '../../store';
import {
  LOGIN_CUTOPIA,
  SEND_VERIFICATION,
  VERIFY_USER,
  RESEND_VERIFICATION,
  SEND_RESET_PASSWORD_CODE,
  RESET_PASSWORD,
} from '../../constants/mutations';
import { LoginPageMode } from '../../types';
import handleCompleted from '../../helpers/handleCompleted';
import { LOGIN_REDIRECT_PAGE } from '../../config';
import Footer from '../molecules/Footer';
import LoadingButton from '../atoms/LoadingButton';

const INITIAL_MODE = LoginPageMode.CUTOPIA_LOGIN;
const MODE_ITEMS = {
  [LoginPageMode.CUTOPIA_LOGIN]: {
    title: 'Log In',
    caption: 'Welcome back',
    userId: 'Username / CUHK SID',
    password: 'Password',
    button: 'Log In',
  },
  [LoginPageMode.CUTOPIA_SIGNUP]: {
    title: 'Sign Up',
    caption: 'A few steps away from unlimited course reviews',
    sid: 'Your CUHK SID (for verification)',
    username: 'Username (2-10 chars, case sensitive)',
    password: 'Password (8-15 chars)',
    button: 'Sign Up',
  },
  [LoginPageMode.VERIFY]: {
    title: 'Verify your account',
    caption:
      'Enter the code from your CUHK email. Check your junk folder if it hasn’t arrived.',
    userId: 'Username / CUHK SID',
    verificationCode: 'Verification Code',
    button: 'Verify',
  },
  [LoginPageMode.RESET_PASSWORD]: {
    title: 'Reset Password',
    caption:
      'Use your CUHK email to reset your password, even if your account is still unverified.',
    userId: 'Username / CUHK SID',
    button: 'Send Reset Code',
  },
  [LoginPageMode.RESET_PASSWORD_VERIFY]: {
    title: 'Set New Password',
    caption:
      'Enter the reset code from your CUHK email and choose a new password.',
    userId: 'Username / CUHK SID',
    password: 'New Password',
    verificationCode: 'Reset Code',
    button: 'Set new password',
  },
};

const PATH_MODE_LOOKUP = {
  'signup': LoginPageMode.CUTOPIA_SIGNUP,
  'login': LoginPageMode.CUTOPIA_LOGIN,
  'verify': LoginPageMode.VERIFY,
  'forgot': LoginPageMode.RESET_PASSWORD,
  'reset-pwd': LoginPageMode.RESET_PASSWORD_VERIFY,
};

const PREVIOUS_MODE_LOOKUP = {
  [LoginPageMode.VERIFY]: LoginPageMode.CUTOPIA_LOGIN,
  [LoginPageMode.RESET_PASSWORD]: LoginPageMode.CUTOPIA_LOGIN,
  [LoginPageMode.RESET_PASSWORD_VERIFY]: LoginPageMode.RESET_PASSWORD,
};

type Props = {
  className?: string;
  returnUrl?: string;
  onSuccess?: () => void;
  hideFooter?: boolean;
};

type QueryParams = {
  mode: string;
  username: string;
  userId: string;
  code: string;
  returnUrl?: string;
};

export const isSid = (str: string) => SID_RULE.test(str);

const LoginPanel: FC<Props> = ({
  className,
  returnUrl,
  onSuccess,
  hideFooter,
}) => {
  const router = useRouter();
  const {
    mode: queryMode,
    username: queryUsername,
    userId: queryUserId,
    code: queryCode,
    returnUrl: queryReturnUrl,
  } = router.query as QueryParams;
  returnUrl ||= queryReturnUrl;
  const [mode, setMode] = useState(INITIAL_MODE);
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sid, setSid] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [invisible, setInvisible] = useState(true);
  const [showResend, setShowResend] = useState(false);
  const [errors, setErrors] = useState({
    verification: null,
    username: null,
    sid: null,
    password: null,
    userId: null,
  });

  const user = useUser();
  const view = useView();

  useEffect(() => {
    const mode = Object.prototype.hasOwnProperty.call(
      PATH_MODE_LOOKUP,
      queryMode
    )
      ? PATH_MODE_LOOKUP[queryMode]
      : INITIAL_MODE;
    if (queryUsername || queryCode || queryUserId) {
      setUsername(queryUsername || '');
      setUserId(queryUserId || queryUsername || '');
      setVerificationCode(queryCode || '');
    }
    // Handle sign up verify (RESET PWD VERIFY NO NEED AUTO, CUZ NEED SET PWD)
    if (mode === LoginPageMode.VERIFY && queryUsername && queryCode) {
      verifyUser({
        variables: {
          username: queryUsername,
          code: queryCode,
        },
      });
    }
    setMode(mode);
  }, [queryMode, queryUsername, queryUserId, queryCode]);

  // Maybe shall disable, and let user switch acc?
  useEffect(() => {
    if (user.loggedIn) {
      router.push(LOGIN_REDIRECT_PAGE);
    }
  }, []);

  const [createUser, { loading: creatingUser, error: createError }] =
    useMutation(SEND_VERIFICATION, {
      onCompleted: handleCompleted(
        () => {
          setUserId(username);
          setMode(LoginPageMode.VERIFY);
        },
        {
          message: 'Verification requested. Check your CUHK email.',
          view,
        }
      ),
      onError: view.handleError,
    });
  const [verifyUser, { loading: verifying, error: verifyError }] = useMutation(
    VERIFY_USER,
    {
      onCompleted: handleCompleted(
        () => {
          setShowResend(false);
          setMode(LoginPageMode.CUTOPIA_LOGIN);
          return loginAndRedirect();
        },
        {
          view,
          message: 'Verification success!',
        }
      ),
      onError: e => {
        view.handleError(e);
        setMode(LoginPageMode.VERIFY);
      },
    }
  );
  const [resendVerification, { loading: resendingVerification }] = useMutation(
    RESEND_VERIFICATION,
    {
      onCompleted: handleCompleted(() => setShowResend(false), {
        message: 'Check your CUHK email for your verification code',
        view,
      }),
      onError: view.handleError,
    }
  );
  const [loginCUtopia, { loading: loggingInCUtopia }] = useMutation(
    LOGIN_CUTOPIA,
    {
      onCompleted: handleCompleted(
        async data => {
          await user.saveUser(
            data.login?.me?.username,
            data.login?.token,
            data.login?.me
          );
          onSuccess?.();
          if (data.login?.me?.username) {
            Sentry.setUser({
              username: data.login?.me?.username,
            });
          }
          // If wrapped in auth route, will push again to reload if same route
          if (router.asPath !== returnUrl) {
            router.push(returnUrl || LOGIN_REDIRECT_PAGE); // return to prev page or review home page
          }
        },
        { mute: true } // login snackbar called user store
      ),
      onError: error => {
        if (
          error.graphQLErrors.some(
            e => e.message === String(ErrorCode.LOGIN_NOT_VERIFIED)
          )
        ) {
          setMode(LoginPageMode.VERIFY);
          return;
        }
        view.handleError(error);
      },
    }
  );
  const [sendResetPasswordCode, { loading: sendingResetCode }] = useMutation(
    SEND_RESET_PASSWORD_CODE,
    {
      onCompleted: handleCompleted(
        () => {
          setVerificationCode('');
          setMode(LoginPageMode.RESET_PASSWORD_VERIFY);
        },
        {
          message: 'Reset requested. Check your CUHK email.',
          view,
        }
      ),
      onError: view.handleError,
    }
  );
  const [resetPassword, { loading: resettingPassword }] = useMutation(
    RESET_PASSWORD,
    {
      onCompleted: handleCompleted(
        () => {
          setPassword('');
          setVerificationCode('');
          setMode(LoginPageMode.CUTOPIA_LOGIN);
        },
        { view, message: 'Password updated. Log in with your new password.' }
      ),
      onError: view.handleError,
    }
  );

  const loginAndRedirect = async () => {
    if (password) {
      const loginPayload = {
        variables: {
          userId: userId || username, // username is for verified user auto login
          password,
        },
      };
      await loginCUtopia(loginPayload);
    } else {
      setMode(LoginPageMode.CUTOPIA_LOGIN);
    }
  };

  const validate = (): boolean => {
    /* Valid username && username is NOT SID */
    const usernameSignUpError =
      mode === LoginPageMode.CUTOPIA_SIGNUP &&
      (!USERNAME_RULE.test(username) || SID_RULE.test(username)) &&
      'Invalid username (2 - 10 length without space, NOT SID)';
    const passwordSignUpError =
      (mode === LoginPageMode.CUTOPIA_SIGNUP ||
        mode === LoginPageMode.RESET_PASSWORD_VERIFY) &&
      !PASSWORD_RULE.test(password) &&
      'Invalid password (8 length up without space)';

    const passwordMissingError =
      MODE_ITEMS[mode].password &&
      !password &&
      `Please enter your ${
        mode === LoginPageMode.CUSIS ? 'OnePass ' : ''
      }password`;
    const errorsFound = {
      verification:
        MODE_ITEMS[mode].verificationCode &&
        !verificationCode.trim() &&
        'Please enter the code from your CUHK email',
      username:
        (MODE_ITEMS[mode].username &&
          !username &&
          'Please choose your username, do NOT use your SID') ||
        usernameSignUpError,
      userId:
        (MODE_ITEMS[mode].userId &&
          !userId &&
          'Please enter your username / CUHK SID') ||
        usernameSignUpError,
      sid:
        MODE_ITEMS[mode].sid &&
        (!sid || !SID_RULE.test(sid)) &&
        'Please enter a valid CUHK SID (Not email)',
      password: passwordMissingError || passwordSignUpError,
    };
    setErrors(errorsFound);
    return !Object.values(errorsFound).some(e => e);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    switch (mode) {
      case LoginPageMode.CUTOPIA_LOGIN: {
        loginAndRedirect();
        break;
      }
      case LoginPageMode.CUTOPIA_SIGNUP: {
        const createUserPayload = {
          variables: {
            username,
            sid: sid,
            password,
          },
        };
        await createUser(createUserPayload);
        break;
      }
      case LoginPageMode.VERIFY: {
        const verifyPayload = {
          variables: {
            username: userId,
            code: verificationCode.trim(),
          },
        };
        await verifyUser(verifyPayload);
        break;
      }
      case LoginPageMode.RESET_PASSWORD: {
        const resetPasswordPayload = {
          variables: {
            userId,
          },
        };
        await sendResetPasswordCode(resetPasswordPayload);
        break;
      }
      case LoginPageMode.RESET_PASSWORD_VERIFY:
        {
          const resetPasswordVerifyPayload = {
            variables: {
              userId,
              newPassword: password,
              resetCode: verificationCode.trim(),
            },
          };
          await resetPassword(resetPasswordVerifyPayload);
        }
        break;
      default:
        break;
    }
  };

  const goBack = () => {
    const prevMode = PREVIOUS_MODE_LOOKUP[mode];
    // If prev mode is a valid mode
    if (prevMode >= 0) {
      setMode(prevMode);
    }
  };

  const openPasswordReset = () => {
    setPassword('');
    setShowResend(false);
    setMode(LoginPageMode.RESET_PASSWORD);
  };

  const processing =
    loggingInCUtopia ||
    creatingUser ||
    verifying ||
    resendingVerification ||
    sendingResetCode ||
    resettingPassword;

  return (
    <div className={clsx(styles.loginPage, 'center column')}>
      <div className={clsx(styles.loginPanel, 'grid-auto-row', className)}>
        <div className={clsx(styles.titleRow, 'column-row')}>
          {mode !== LoginPageMode.CUTOPIA_LOGIN &&
            mode !== LoginPageMode.CUTOPIA_SIGNUP && (
              <IconButton
                className={styles.goBackIcon}
                onClick={goBack}
                aria-label="Go back"
                size="large"
              >
                <ArrowBack />
              </IconButton>
            )}
          <h2 className="title">{MODE_ITEMS[mode].title}</h2>
          <span className="caption">{MODE_ITEMS[mode].caption}</span>
        </div>
        <form className="grid-auto-row" onSubmit={onSubmit}>
          {MODE_ITEMS[mode].sid && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.sid}
              placeholder={MODE_ITEMS[mode].sid}
              type="number"
              value={sid}
              onChangeText={text => setSid(text)}
              label="CUHK SID"
            />
          )}
          {MODE_ITEMS[mode].username && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.username}
              placeholder={MODE_ITEMS[mode].username}
              value={username}
              onChangeText={text => setUsername(text)}
              label="Username"
            />
          )}
          {MODE_ITEMS[mode].userId && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.userId}
              placeholder={MODE_ITEMS[mode].userId}
              value={userId}
              onChangeText={text => setUserId(text)}
              autoComplete="username"
              label="Username / SID"
            />
          )}
          {MODE_ITEMS[mode].password && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.password}
              placeholder={MODE_ITEMS[mode].password}
              value={password}
              onChangeText={text => setPassword(text)}
              type={invisible ? 'password' : 'text'}
              autoComplete={
                mode === LoginPageMode.CUTOPIA_LOGIN
                  ? 'current-password'
                  : 'new-password'
              }
              label={
                mode === LoginPageMode.RESET_PASSWORD_VERIFY
                  ? 'New password'
                  : 'Password'
              }
            />
          )}
          {MODE_ITEMS[mode].verificationCode && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.verification}
              placeholder={MODE_ITEMS[mode].verificationCode}
              value={verificationCode}
              onChangeText={text => setVerificationCode(text)}
              autoComplete="one-time-code"
              label={MODE_ITEMS[mode].verificationCode}
            />
          )}
          {mode === LoginPageMode.CUTOPIA_LOGIN && (
            <div className={clsx(styles.forgotPwdRow, 'center-row')}>
              <Button
                size="small"
                type="button"
                className={styles.label}
                onClick={() => setMode(LoginPageMode.VERIFY)}
              >
                Continue verification
              </Button>
              <Button
                size="small"
                type="button"
                className={styles.label}
                onClick={openPasswordReset}
              >
                Forgot password?
              </Button>
            </div>
          )}
          {mode === LoginPageMode.VERIFY && (
            <>
              {showResend && (
                <TextField
                  className={styles.loginInputContainer}
                  placeholder="Account password"
                  value={password}
                  onChangeText={setPassword}
                  type="password"
                  autoComplete="current-password"
                  label="Account password"
                />
              )}
              <div className={clsx(styles.forgotPwdRow, 'center-row')}>
                <Button
                  size="small"
                  type="button"
                  className={styles.label}
                  disabled={
                    processing || (showResend && (!userId || !password))
                  }
                  onClick={() => {
                    if (!showResend) {
                      setShowResend(true);
                      return;
                    }
                    void resendVerification({
                      variables: { userId, password },
                    });
                  }}
                >
                  {showResend ? 'Send verification code' : 'Resend code'}
                </Button>
                <Button
                  size="small"
                  type="button"
                  className={styles.label}
                  onClick={openPasswordReset}
                  disabled={processing}
                >
                  Forgot password?
                </Button>
              </div>
            </>
          )}
          <LoadingButton
            variant="contained"
            className={styles.loginBtn}
            color="primary"
            type="submit"
            disabled={processing}
            loading={processing}
          >
            {MODE_ITEMS[mode].button}
          </LoadingButton>
        </form>
        {(mode === LoginPageMode.CUTOPIA_LOGIN ||
          mode === LoginPageMode.CUTOPIA_SIGNUP) && (
          <div className={clsx(styles.switchContainer, 'center-row')}>
            <span className="caption">
              {mode === LoginPageMode.CUTOPIA_LOGIN
                ? "Don't have an account?"
                : 'Already have an account?'}
            </span>
            <span
              className={styles.label}
              onClick={() =>
                setMode(
                  mode === LoginPageMode.CUTOPIA_LOGIN
                    ? LoginPageMode.CUTOPIA_SIGNUP
                    : LoginPageMode.CUTOPIA_LOGIN
                )
              }
            >
              {mode === LoginPageMode.CUTOPIA_SIGNUP ? 'Log In' : 'Sign Up'}
            </span>
          </div>
        )}
        {!hideFooter && mode === LoginPageMode.CUTOPIA_LOGIN && (
          <Link href="/planner" passHref>
            <Button className={styles.guestPlannerLink} size="small">
              Use Planner as a guest
            </Button>
          </Link>
        )}
      </div>
      <Footer mb visible={!hideFooter} />
    </div>
  );
};

export default observer(LoginPanel);
