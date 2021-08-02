import { useState, useContext, useEffect, useRef } from 'react';
import { Button, IconButton, CircularProgress } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import QRCode from 'qrcode.react';

import { observer } from 'mobx-react-lite';
import { useMutation } from '@apollo/client';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { nanoid } from 'nanoid';

import './LoginPanel.scss';
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

const LOGIN_ACCENT = '#873AFD';
const CUHK_EMAIL_SUFFIX = '@link.cuhk.edu.hk';
const MODE_ITEMS = {
  [LoginPageMode.CUTOPIA_LOGIN]: {
    title: 'Log In',
    caption: 'Welcome back',
    username: 'Your username for CUtopia',
    password: 'Password for CUtopia Account',
    button: 'Log In',
  },
  [LoginPageMode.CUTOPIA_SIGNUP]: {
    title: 'Sign Up',
    caption: 'A few steps away from unlimited course reviews',
    userId: 'Your CUHK SID (For Verification)',
    username: 'Username',
    password: 'Password',
    button: 'Sign Up',
  },
  [LoginPageMode.VERIFY]: {
    title: 'Verify',
    caption:
      'An verification code has been sent to CUHK email.\nPlease enter your code here:',
    verificationCode: 'Your Verification Code',
    button: 'Verify',
  },
  [LoginPageMode.RESET_PASSWORD]: {
    title: 'Reset Password',
    caption: 'An verification code will be send to your CUHK email',
    username: 'Your CUtopia Username',
    button: 'Send Reset Code',
  },
  [LoginPageMode.RESET_PASSWORD_VERIFY]: {
    title: 'Verify',
    caption: 'An verification code will be send to your CUHK email',
    password: 'New Password',
    verificationCode: 'Your Verification Code',
    button: 'Send',
  },
};

const LoginPanel = () => {
  const initialMode = LoginPageMode.CUTOPIA_SIGNUP;

  const [mode, setMode] = useState(initialMode);
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

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'wss://1rys6xiqvk.execute-api.ap-northeast-1.amazonaws.com/Prod'
  );
  const [QRCodeData, setQRCodeData] = useState('');
  const accessPwd = useRef('');

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !QRCodeData) {
      sendMessage(
        JSON.stringify({
          action: 'sendmessage',
          type: 'getSelfId',
        })
      );
    }
  }, [readyState, QRCodeData]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    try {
      const data = JSON.parse(lastMessage.data);
      if (data.connectionId) {
        const pwd = nanoid(10);
        accessPwd.current = pwd;
        setQRCodeData(
          JSON.stringify({
            valid: 'CUtopia',
            id: data.connectionId,
            pwd,
          })
        );
      }

      if (data.pwd !== accessPwd.current) {
        console.warn('Unauthorized');
        return;
      }

      if (data.type === 'token') {
        user.saveUser(data.username, data.token);
      }
    } catch (err) {
      console.warn(err);
    }
  }, [lastMessage]);

  const [createUser, { loading: creatingUser, error: createError }] =
    useMutation(SEND_VERIFICATION, {
      onCompleted: handleCompleted(() => setMode(LoginPageMode.VERIFY), {
        message: 'Verification code send to your CUHK email',
        view,
      }),
      onError: view.handleError,
    });
  const [verifyUser, { loading: verifying, error: verifyError }] = useMutation(
    VERIFY_USER,
    {
      onCompleted: handleCompleted(() => loginAndRedirect(), {
        view,
      }),
      onError: view.handleError,
    }
  );
  const [loginCUtopia, { loading: loggingInCUtopia }] = useMutation(
    LOGIN_CUTOPIA,
    {
      onCompleted: handleCompleted(
        async (data) => await user.saveUser(username, data.login?.token)
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
      onCompleted: handleCompleted(() => setMode(LoginPageMode.CUTOPIA_LOGIN), {
        view,
      }),
      onError: view.handleError,
    }
  );

  const loginAndRedirect = async () => {
    const loginPayload = {
      variables: {
        username,
        password,
      },
    };
    await loginCUtopia(loginPayload);
  };

  useEffect(() => {
    mode !== null && console.log(mode);
  }, [mode]);

  const validate = (): boolean => {
    const errorsFound = {
      verification:
        MODE_ITEMS[mode].verificationCode &&
        !verificationCode &&
        'Please enter the verification code',
      username:
        MODE_ITEMS[mode].username &&
        !username &&
        'Please choose your CUtopia username',
      userId:
        MODE_ITEMS[mode].userId &&
        (!userId || !/^[0-9]{10}$/i.test(userId)) &&
        'Please enter an valid CUHK SID (Not email)',
      password:
        MODE_ITEMS[mode].password &&
        !password &&
        `Please enter your ${
          mode === LoginPageMode.CUSIS ? 'OnePass ' : ''
        }password`,
    };
    setErrors(errorsFound);
    return !Object.values(errorsFound).some((e) => e);
  };

  const onSubmit = async (e) => {
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
            email: `${userId}${CUHK_EMAIL_SUFFIX}`,
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
        setMode(LoginPageMode.CUTOPIA_LOGIN);
        break;
      case LoginPageMode.RESET_PASSWORD:
        setMode(LoginPageMode.CUTOPIA_LOGIN);
        break;
      case LoginPageMode.RESET_PASSWORD_VERIFY:
        setMode(LoginPageMode.RESET_PASSWORD);
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
        {mode === LoginPageMode.CUTOPIA_LOGIN &&
          (readyState === ReadyState.OPEN && QRCodeData ? (
            <QRCode value={QRCodeData} size={64} />
          ) : (
            <CircularProgress />
          ))}
      </div>
      <form className="grid-auto-row" onSubmit={onSubmit}>
        {MODE_ITEMS[mode].userId && (
          <TextField
            error={errors.userId}
            placeholder={MODE_ITEMS[mode].userId}
            type="number"
            value={userId}
            onChangeText={(text) => setUserId(text)}
            label="CUHK SID"
          />
        )}
        {MODE_ITEMS[mode].verificationCode && (
          <TextField
            error={errors.verification}
            placeholder={MODE_ITEMS[mode].verificationCode}
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text)}
            label="Verification Code"
          />
        )}
        {MODE_ITEMS[mode].username && (
          <TextField
            error={errors.username}
            placeholder={MODE_ITEMS[mode].username}
            value={username}
            onChangeText={(text) => setUsername(text)}
            label="Username"
          />
        )}
        {MODE_ITEMS[mode].password && (
          <TextField
            error={errors.password}
            placeholder={MODE_ITEMS[mode].password}
            defaultValue=""
            value={password}
            onChangeText={(text) => setPassword(text)}
            type={invisible ? 'password' : 'text'}
            label="Password"
          />
        )}
        {mode === LoginPageMode.CUTOPIA_LOGIN && (
          <div className="center-row forgot-password-row">
            <span
              className="label forgot-password"
              onClick={() => setMode(LoginPageMode.RESET_PASSWORD)}
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
  );
};
export default observer(LoginPanel);
