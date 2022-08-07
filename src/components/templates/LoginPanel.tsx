import { useState, useEffect, FC } from 'react';
import { Button, IconButton, CircularProgress } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import * as Sentry from '@sentry/nextjs';
import { observer } from 'mobx-react-lite';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import styles from '../../styles/pages/login.module.scss';
import TextField from '../atoms/TextField';
import { useView, useUser } from '../../store';
import {
  LOGIN_CUTOPIA,
  SEND_VERIFICATION,
  VERIFY_USER,
  SEND_RESET_PASSWORD_CODE,
  RESET_PASSWORD,
} from '../../constants/mutations';
import { LoginPageMode } from '../../types';
import handleCompleted from '../../helpers/handleCompleted';
import { reverseMapping } from '../../helpers';
import { LOGIN_REDIRECT_PAGE } from '../../config';
import { USERNAME_RULE, SID_RULE, PASSWORD_RULE } from '../../helpers/rules';
import Footer from '../molecules/Footer';

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
    title: 'Verify',
    caption:
      'An verification code has been sent to CUHK email.\nPlease enter your code here:',
    verificationCode: 'Verification Code',
    button: 'Verify',
  },
  [LoginPageMode.RESET_PASSWORD]: {
    title: 'Reset Password',
    caption: 'An verification code will be sent to your CUHK email',
    userId: 'Username / CUHK SID',
    button: 'Send Reset Code',
  },
  [LoginPageMode.RESET_PASSWORD_VERIFY]: {
    title: 'Set New Password',
    caption:
      'Please enter new password and the verification code in your CUHK email',
    password: 'New Password',
    verificationCode: 'Verification Code',
    button: 'Send',
  },
};

const PATH_MODE_LOOKUP = {
  'signup': LoginPageMode.CUTOPIA_SIGNUP,
  'login': LoginPageMode.CUTOPIA_LOGIN,
  'verify': LoginPageMode.VERIFY,
  'forgot': LoginPageMode.RESET_PASSWORD,
  'reset-pwd': LoginPageMode.RESET_PASSWORD_VERIFY,
};

const MODE_PATH_LOOKUP = reverseMapping(PATH_MODE_LOOKUP);

const PREVIOUS_MODE_LOOKUP = {
  [LoginPageMode.VERIFY]: LoginPageMode.CUTOPIA_LOGIN,
  [LoginPageMode.RESET_PASSWORD]: LoginPageMode.CUTOPIA_LOGIN,
  [LoginPageMode.RESET_PASSWORD_VERIFY]: LoginPageMode.RESET_PASSWORD,
};

type Props = {
  className?: string;
  returnUrl?: string;
};

type QueryParams = {
  mode: string;
  username: string;
  userId: string;
  code: string;
  returnUrl?: string;
};

export const isSid = (str: string) =>
  str.startsWith('11') && SID_RULE.test(str);

const LoginPanel: FC<Props> = ({ className, returnUrl }) => {
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
    const mode = queryMode ? PATH_MODE_LOOKUP[queryMode] : INITIAL_MODE;
    if (queryUsername || queryCode || queryUserId) {
      setUsername(queryUsername);
      setUserId(queryUserId);
      setVerificationCode(queryCode);
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
  }, [queryMode]);

  // Maybe shall disable, and let user switch acc?
  useEffect(() => {
    if (user.loggedIn) {
      router.push(LOGIN_REDIRECT_PAGE);
    }
  }, []);

  const [createUser, { loading: creatingUser, error: createError }] =
    useMutation(SEND_VERIFICATION, {
      onCompleted: handleCompleted(() => setMode(LoginPageMode.VERIFY), {
        message: 'Verification code has been sent to your CUHK email',
        view,
      }),
      onError: view.handleError,
    });
  const [verifyUser, { loading: verifying, error: verifyError }] = useMutation(
    VERIFY_USER,
    {
      onCompleted: handleCompleted(() => loginAndRedirect(), {
        view,
        message: 'Verification success!',
      }),
      onError: e => {
        view.handleError(e);
        setMode(LoginPageMode.VERIFY);
      },
    }
  );
  const [loginCUtopia, { loading: loggingInCUtopia }] = useMutation(
    LOGIN_CUTOPIA,
    {
      onCompleted: handleCompleted(
        async data => {
          user.saveUser(username, data.login?.token, data.login?.me);
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
      onError: view.handleError,
    }
  );
  const [sendResetPasswordCode, { loading: sendingResetCode }] = useMutation(
    SEND_RESET_PASSWORD_CODE,
    {
      onCompleted: handleCompleted(
        () => setMode(LoginPageMode.RESET_PASSWORD_VERIFY),
        {
          message: 'Verification code has been sent to your CUHK email',
          view,
        }
      ),
      onError: view.handleError,
    }
  );
  const [resetPassword, { loading: resettingPassword }] = useMutation(
    RESET_PASSWORD,
    {
      onCompleted: handleCompleted(() => setMode(LoginPageMode.CUTOPIA_LOGIN), {
        view,
      }),
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
        !verificationCode &&
        'Please enter the verification code',
      username:
        (MODE_ITEMS[mode].username &&
          !username &&
          'Please choose your CUtopia username, do use ur SID') ||
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
    if (!validate()) {
      return;
    }
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
            username,
            code: verificationCode,
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
              resetCode: verificationCode,
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

  return (
    <div className={clsx(styles.loginPage, 'center column')}>
      <div className={clsx(styles.loginPanel, 'grid-auto-row', className)}>
        <div className={clsx(styles.qrcodeRow, 'center-row')}>
          <div>
            {mode !== LoginPageMode.CUTOPIA_LOGIN &&
              mode !== LoginPageMode.CUTOPIA_SIGNUP && (
                <IconButton className={styles.goBackIcon} onClick={goBack}>
                  <ArrowBack />
                </IconButton>
              )}
            <h2 className="title">{MODE_ITEMS[mode].title}</h2>
            <span className="caption">{MODE_ITEMS[mode].caption}</span>
          </div>
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
              label="Password"
            />
          )}
          {MODE_ITEMS[mode].verificationCode && (
            <TextField
              className={styles.loginInputContainer}
              error={errors.verification}
              placeholder={MODE_ITEMS[mode].verificationCode}
              value={verificationCode}
              onChangeText={text => setVerificationCode(text)}
              label="Verification Code"
            />
          )}
          {mode === LoginPageMode.CUTOPIA_LOGIN && (
            <div className={clsx(styles.forgotPwdRow, 'center-row')}>
              <span
                className={clsx(styles.label, styles.forgotPwdLabel)}
                onClick={() => setMode(LoginPageMode.RESET_PASSWORD)}
              >
                Forgot Password?
              </span>
            </div>
          )}
          <Button
            variant="contained"
            className={styles.loginBtn}
            color="primary"
            type="submit"
            disabled={
              loggingInCUtopia ||
              creatingUser ||
              verifying ||
              sendingResetCode ||
              resettingPassword
            }
          >
            {loggingInCUtopia ||
            creatingUser ||
            verifying ||
            sendingResetCode ||
            resettingPassword ? (
              <CircularProgress size={24} />
            ) : (
              MODE_ITEMS[mode].button
            )}
          </Button>
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
      </div>
      <Footer mb />
    </div>
  );
};

export default observer(LoginPanel);
