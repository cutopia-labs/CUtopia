import { useState, useContext, useEffect } from 'react';
import { Button, IconButton, CircularProgress } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import * as Sentry from '@sentry/react';
import { observer } from 'mobx-react-lite';
import { useMutation } from '@apollo/client';

import { useLocation } from 'react-use';
import { useRouter } from 'next/router';
import styles from '../../styles/components/user/LoginPanel.module.scss';
import TextField from '../atoms/TextField';
import { UserContext, ViewContext } from '../../store';
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

const INITIAL_MODE = LoginPageMode.CUTOPIA_SIGNUP;
const MODE_ITEMS = {
  [LoginPageMode.CUTOPIA_LOGIN]: {
    title: 'Log In',
    caption: 'Welcome back',
    username: 'Username',
    password: 'Password',
    button: 'Log In',
  },
  [LoginPageMode.CUTOPIA_SIGNUP]: {
    title: 'Sign Up',
    caption: 'A few steps away from unlimited course reviews',
    userId: 'Your CUHK SID (for verification)',
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
    caption: 'An verification code will be send to your CUHK email',
    username: 'Username',
    button: 'Send Reset Code',
  },
  [LoginPageMode.RESET_PASSWORD_VERIFY]: {
    title: 'Set New Password',
    caption:
      'Please enter new password an the verification code in your CUHK email',
    password: 'New Password',
    verificationCode: 'Verification Code',
    button: 'Send',
  },
};

const PATH_MODE_LOOKUP = {
  '/': INITIAL_MODE,
  '/signup': LoginPageMode.CUTOPIA_SIGNUP,
  '/login': LoginPageMode.CUTOPIA_LOGIN,
  '/verify': LoginPageMode.VERIFY,
  '/forgot': LoginPageMode.RESET_PASSWORD,
  '/reset-pasword': LoginPageMode.RESET_PASSWORD_VERIFY,
};

const MODE_PATH_LOOKUP = reverseMapping(PATH_MODE_LOOKUP);

const USER_ID_RULE = new RegExp('^[0-9]{10}$');
const USERNAME_RULE = new RegExp(
  `^[A-Za-z0-9\u3000\u3400-\u4DBF\u4E00-\u9FFF]{2,10}$`
);
const PASSWORD_RULE = new RegExp(`^[A-Za-z0-9@$!%*#?&^_-]{8,15}$`);

/*
Contains no space

Allow only alphas + digits + @$!%*#?&^_-

8 - 15 length
*/

const LoginPanel = () => {
  const location = useLocation();
  const router = useRouter();
  const [mode, setMode] = useState(INITIAL_MODE);
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [invisible, setInvisible] = useState(true);
  const [errors, setErrors] = useState({
    verification: null,
    username: null,
    userId: null,
    password: null,
  });

  const user = useContext(UserContext);
  const view = useContext(ViewContext);

  useEffect(() => {
    const mode = PATH_MODE_LOOKUP[location.pathname];
    if (!mode) {
      if (location.pathname.startsWith('/account')) {
        const subpath = location.pathname.substring(9);
        const params = new URLSearchParams(location.search.substring(1));
        const username = params.get('user');
        const code = params.get('code');
        setUsername(username);
        setVerificationCode(code);
        switch (subpath) {
          case 'verify': {
            verifyUser({
              variables: {
                username,
                code,
              },
            });
            setMode(LoginPageMode.VERIFY);
            break;
          }
          case 'reset-password': {
            setMode(LoginPageMode.RESET_PASSWORD_VERIFY);
            break;
          }
        }
        return;
      }
      router.push('/');
    }
    setMode(mode || INITIAL_MODE);
  }, [location.pathname]);

  const [createUser, { loading: creatingUser, error: createError }] =
    useMutation(SEND_VERIFICATION, {
      onCompleted: handleCompleted(
        () => router.push(MODE_PATH_LOOKUP[LoginPageMode.VERIFY]),
        {
          message: 'Verification code send to your CUHK email',
          view,
        }
      ),
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
        router.push('/verify');
      },
    }
  );
  const [loginCUtopia, { loading: loggingInCUtopia }] = useMutation(
    LOGIN_CUTOPIA,
    {
      onCompleted: handleCompleted(async data => {
        await user.saveUser(username, data.login?.token, data.login?.me);
        if (data.login?.me?.username) {
          Sentry.setUser({
            username: data.login?.me?.username,
          });
        }
        router.push('/');
      }),
      onError: view.handleError,
    }
  );
  const [sendResetPasswordCode, { loading: sendingResetCode }] = useMutation(
    SEND_RESET_PASSWORD_CODE,
    {
      onCompleted: handleCompleted(
        () =>
          router.push(MODE_PATH_LOOKUP[LoginPageMode.RESET_PASSWORD_VERIFY]),
        {
          message: 'Verification code has been send to your CUHK email',
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
        () => router.push(MODE_PATH_LOOKUP[LoginPageMode.CUTOPIA_LOGIN]),
        {
          view,
        }
      ),
      onError: view.handleError,
    }
  );

  const loginAndRedirect = async () => {
    if (password) {
      const loginPayload = {
        variables: {
          username,
          password,
        },
      };
      await loginCUtopia(loginPayload);
    } else {
      setMode(LoginPageMode.CUTOPIA_LOGIN);
    }
  };

  const validate = (): boolean => {
    const usernameSignUpError =
      mode === LoginPageMode.CUTOPIA_SIGNUP &&
      !USERNAME_RULE.test(username) &&
      'Invalid username (2 - 10 length without space)';
    const passwordSignUpError =
      (mode === LoginPageMode.CUTOPIA_SIGNUP ||
        mode === LoginPageMode.RESET_PASSWORD_VERIFY) &&
      !PASSWORD_RULE.test(password) &&
      'Invalid password (8 - 15 length without space)';
    console.log(`sign up error ${passwordSignUpError}`);
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
          'Please choose your CUtopia username') ||
        usernameSignUpError,
      userId:
        MODE_ITEMS[mode].userId &&
        (!userId || !USER_ID_RULE.test(userId)) &&
        'Please enter an valid CUHK SID (Not email)',
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
            sid: userId,
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
            username,
          },
        };
        await sendResetPasswordCode(resetPasswordPayload);
        break;
      }
      case LoginPageMode.RESET_PASSWORD_VERIFY:
        {
          const resetPasswordVerifyPayload = {
            variables: {
              username,
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
    switch (mode) {
      case LoginPageMode.VERIFY:
        router.push(MODE_PATH_LOOKUP[LoginPageMode.CUTOPIA_LOGIN]);
        break;
      case LoginPageMode.RESET_PASSWORD:
        router.push(MODE_PATH_LOOKUP[LoginPageMode.CUTOPIA_LOGIN]);
        break;
      case LoginPageMode.RESET_PASSWORD_VERIFY:
        router.push(MODE_PATH_LOOKUP[LoginPageMode.RESET_PASSWORD]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="login-panel grid-auto-row">
      <div className="center-row qrcode-row">
        <div>
          {mode !== LoginPageMode.CUTOPIA_LOGIN &&
            mode !== LoginPageMode.CUTOPIA_SIGNUP && (
              <IconButton className="go-back-icon" onClick={goBack}>
                <ArrowBack />
              </IconButton>
            )}
          <h2 className="title">{MODE_ITEMS[mode].title}</h2>
          <span className="caption">{MODE_ITEMS[mode].caption}</span>
        </div>
      </div>
      <form className="grid-auto-row" onSubmit={onSubmit}>
        {MODE_ITEMS[mode].userId && (
          <TextField
            className={styles.loginInputContainer}
            error={errors.userId}
            placeholder={MODE_ITEMS[mode].userId}
            type="number"
            value={userId}
            onChangeText={text => setUserId(text)}
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
          <div className="center-row forgot-password-row">
            <span
              className="label forgot-password"
              onClick={() =>
                router.push(MODE_PATH_LOOKUP[LoginPageMode.RESET_PASSWORD])
              }
            >
              Forgot Password?
            </span>
          </div>
        )}
        <Button
          variant="contained"
          className="login-btn"
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
        <div className="switch-container center-row">
          <span className="caption">
            {mode === LoginPageMode.CUTOPIA_LOGIN
              ? "Don't have an account?"
              : 'Already have an account?'}
          </span>
          <span
            className="label"
            onClick={() =>
              router.push(
                MODE_PATH_LOOKUP[
                  mode === LoginPageMode.CUTOPIA_LOGIN
                    ? LoginPageMode.CUTOPIA_SIGNUP
                    : LoginPageMode.CUTOPIA_LOGIN
                ]
              )
            }
          >
            {mode === LoginPageMode.CUTOPIA_SIGNUP ? 'Log In' : 'Sign Up'}
          </span>
        </div>
      )}
    </div>
  );
};
export default observer(LoginPanel);
