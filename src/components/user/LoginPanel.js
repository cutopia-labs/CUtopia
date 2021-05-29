import React, {
  useState, useContext, useEffect, useRef,
} from 'react';
import {
  Button, IconButton, Checkbox, CircularProgress,
} from '@material-ui/core';
import {
  ArrowBack,
} from '@material-ui/icons';
import QRCode from 'qrcode.react';

import { observer } from 'mobx-react-lite';
import { useMutation } from '@apollo/client';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { nanoid } from 'nanoid';

import './LoginPanel.css';
import TextField from '../TextField';
import { PreferenceContext, UserContext, NotificationContext } from '../../store';
import { LOGIN_CODES, VERIFICATION_CODES, MODES } from '../../constants/states';
import {
  LOGIN_CUTOPIA, SEND_VERIFICATION, VERIFY_USER, SEND_RESET_PASSWORD_CODE, RESET_PASSWORD,
} from '../../constants/mutations';

const LOGIN_ACCENT = '#873AFD';
const CUHK_EMAIL_SUFFIX = '@link.cuhk.edu.hk';
const MODE_ITEMS = {
  [MODES.CUTOPIA_LOGIN]: {
    title: 'Log In',
    caption: 'Log in to unlock course reviews',
    username: 'Your username for CUtopia',
    password: 'Password for CUtopia Account',
    button: 'Log In',
  },
  [MODES.CUTOPIA_SIGNUP]: {
    title: 'Sign Up',
    caption: 'Sign up now to unlock course reviews',
    userId: 'Your CUHK SID (For Verification)',
    username: 'Your username for CUtopia',
    password: 'Password for CUtopia Account',
    button: 'Sign Up',
  },
  [MODES.VERIFY]: {
    title: 'Verify',
    caption: 'An verification code has been sent to CUHK email.\nPlease enter your code here:',
    verificationCode: 'Your Verification Code',
    button: 'Verify',
  },
  [MODES.RESET_PASSWORD]: {
    title: 'Reset Password',
    caption: 'An verification code will be send to your CUHK email',
    username: 'Your CUtopia Username',
    button: 'Send Reset Code',
  },
  [MODES.RESET_PASSWORD_VERIFY]: {
    title: 'Verify',
    caption: 'An verification code will be send to your CUHK email',
    password: 'New Password',
    verificationCode: 'Your Verification Code',
    button: 'Send',
  },
};

const LoginPanel = ({ route, navigation }) => {
  const initialMode = MODES.CUTOPIA_SIGNUP;

  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState();
  const [verificationCode, setVerificationCode] = useState();
  const [userId, setUserId] = useState();
  const [password, setPassword] = useState();
  const [rememberMe, setRememberMe] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [errors, setErrors] = useState({
    emptyVerification: null,
    emptyUsername: null,
    emptyEmail: null,
    emptyPassword: null,
  });

  const preference = useContext(PreferenceContext);
  const user = useContext(UserContext);
  const notification = useContext(NotificationContext);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket('wss://1rys6xiqvk.execute-api.ap-northeast-1.amazonaws.com/Prod');
  const [QRCodeData, setQRCodeData] = useState();
  const accessPwd = useRef();

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !QRCodeData) {
      sendMessage(JSON.stringify({
        action: 'sendmessage',
        type: 'getSelfId',
      }));
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
        setQRCodeData(JSON.stringify({
          valid: 'CUtopia',
          id: data.connectionId,
          pwd,
        }));
      }

      if (data.pwd !== accessPwd.current) {
        console.warn('Unauthorized');
        return;
      }

      if (data.type === 'token') {
        user.saveCutopiaAccount(data.username, data.userId, null, data.token);
      }
    }
    catch (err) {
      console.warn(err);
    }
  }, [lastMessage]);

  const [createUser, { loading: creatingUser, error: createError }] = useMutation(SEND_VERIFICATION);
  const [verifyUser, { loading: verifying, error: verifyError }] = useMutation(VERIFY_USER);
  const [loginCUtopia, { loading: loggingInCUtopia }] = useMutation(LOGIN_CUTOPIA);
  const [sendResetPasswordCode, { loading: sendingResetCode }] = useMutation(SEND_RESET_PASSWORD_CODE);
  const [resetPassword, { loading: resettingPassword }] = useMutation(RESET_PASSWORD);

  const loginAndRedirect = async () => {
    const loginPayload = {
      variables: {
        username,
        password,
      },
    };
    const { data } = await loginCUtopia(loginPayload);
    if (data?.login.code === LOGIN_CODES.SUCCEEDED) {
      console.log(`Login success with token ${data.login.token}`);
      await user.saveCutopiaAccount(
        username,
        userId,
        rememberMe && password,
        data.login.token,
      );
    }
    else if (data?.login.code === LOGIN_CODES.FAILED) {
      alert('Wrong Password!');
    }
    else {
      alert('User doesn\'t exist!');
    }
  };

  useEffect(() => {
    console.log(mode === MODES.CUTOPIA);
    mode !== null && console.log(mode);
  }, [mode]);

  const onSubmit = async () => {
    const errorsFound = {
      verification: MODE_ITEMS[mode].verificationCode && !verificationCode && 'Please enter the verification code',
      username: MODE_ITEMS[mode].username && !username && 'Please choose your CUtopia username',
      userId: MODE_ITEMS[mode].userId && (!userId || !/^[0-9]{10}$/i.test(userId)) && 'Please enter an valid CUHK SID (Not email)',
      password: MODE_ITEMS[mode].password && !password && `Please enter your ${mode === MODES.CUSIS ? 'OnePass ' : ''}password`,
    };
    setErrors(errorsFound);
    const hasError = Object.values(errorsFound).some(e => e);
    if (hasError) {
      return;
    }
    switch (mode) {
      case MODES.CUSIS: { // curly braces for const scope
        await user.login(userId, password, rememberMe);
        break;
      }
      case MODES.CUTOPIA_LOGIN: {
        loginAndRedirect();
        break;
      }
      case MODES.CUTOPIA_SIGNUP: {
        const createUserPayload = {
          variables: {
            username,
            email: `${userId}${CUHK_EMAIL_SUFFIX}`,
            password,
          },
        };
        const { data } = await createUser(createUserPayload);
        (!data || data.error) ? alert(data.error) : setMode(MODES.VERIFY);
        break;
      }
      case MODES.VERIFY: {
        const verifyPayload = {
          variables: {
            username,
            code: verificationCode,
          },
        };
        const res = await verifyUser(verifyPayload);
        switch (res.data.verifyUser.code) {
          case VERIFICATION_CODES.SUCCEEDED:
            loginAndRedirect();
            break;
          case VERIFICATION_CODES.FAILED:
            alert('Failed to verify');
            break;
          case VERIFICATION_CODES.ALREADY_VERIFIED:
            alert('CUHK SID already verified!');
            break;
          case VERIFICATION_CODES.USER_DNE:
            alert('User doesn\'t exist!');
            break;
          default:
            break;
        }
        break;
      }
      case MODES.RESET_PASSWORD: {
        const resetPasswordPayload = {
          variables: {
            username,
          },
        };
        const res = (await sendResetPasswordCode(resetPasswordPayload)).data.sendResetPasswordCode;
        res.error ? alert(res.error) : setMode(MODES.RESET_PASSWORD_VERIFY);
        break;
      }
      case MODES.RESET_PASSWORD_VERIFY: {
        const resetPasswordVerifyPayload = {
          variables: {
            username,
            newPassword: password,
            resetCode: verificationCode,
          },
        };
        console.log(resetPasswordVerifyPayload);
        const res = (await resetPassword(resetPasswordVerifyPayload)).data.resetPassword;
        res.error ? alert(res.error) : setMode(MODES.CUTOPIA_LOGIN);
      }
        break;
      default:
        break;
    }
  };

  const goBack = () => {
    switch (mode) {
      case MODES.VERIFY:
        setMode(MODES.CUTOPIA_LOGIN);
        break;
      case MODES.RESET_PASSWORD:
        setMode(MODES.CUTOPIA_LOGIN);
        break;
      case MODES.RESET_PASSWORD_VERIFY:
        setMode(MODES.RESET_PASSWORD);
        break;
      default:
        break;
    }
  };

  return (
    <div className="login-panel">
      <div className="center-row qrcode-row">
        <div>
          {
            mode !== MODES.CUTOPIA_LOGIN && mode !== MODES.CUTOPIA_SIGNUP
            && (
              <IconButton
                className="go-back-icon"
                onClick={goBack}
              >
                <ArrowBack />
              </IconButton>
            )
          }
          <h2 className="title">{MODE_ITEMS[mode].title}</h2>
          <span className="caption">{MODE_ITEMS[mode].caption}</span>
        </div>
        {mode === MODES.CUTOPIA_LOGIN && (
          (readyState === ReadyState.OPEN && QRCodeData)
            ? <QRCode value={QRCodeData} size={64} />
            : <CircularProgress />
        )}
      </div>
      {
        MODE_ITEMS[mode].userId
        && (
          <TextField
            error={errors.userId}
            placeholder={MODE_ITEMS[mode].userId}
            keyboardType="number"
            value={userId}
            onChangeText={text => setUserId(text)}
          />
        )
      }
      {
        MODE_ITEMS[mode].verificationCode
        && (
          <TextField
            error={errors.verificationCode}
            placeholder={MODE_ITEMS[mode].verificationCode}
            value={verificationCode}
            onChangeText={text => setVerificationCode(text)}
          />
        )
      }
      {
        MODE_ITEMS[mode].username
        && (
          <TextField
            error={errors.username}
            placeholder={MODE_ITEMS[mode].username}
            value={username}
            onChangeText={text => setUsername(text)}
          />
        )
      }
      {
        MODE_ITEMS[mode].password
        && (
          <TextField
            error={errors.password}
            placeholder={MODE_ITEMS[mode].password}
            defaultValue=""
            value={password}
            onChangeText={text => setPassword(text)}
            keyboardType={invisible ? 'password' : 'text'}
          />
        )
      }
      {
        mode === MODES.CUTOPIA_LOGIN
        && (
          <div className="center-row check-box-row">
            <div className="center-row check-box-container">
              <Checkbox
                className="check-box"
                color={LOGIN_ACCENT}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span className="caption check-box-label">Remember Me</span>
            </div>
            <span className="label" onClick={() => setMode(MODES.RESET_PASSWORD)}>
              Forgot Password?
            </span>
          </div>
        )
      }
      <Button
        variant="contained"
        className="login-btn"
        color="primary"
        onClick={onSubmit}
        disabled={loggingInCUtopia || creatingUser || verifying || sendingResetCode || resettingPassword}
      >
        {
          loggingInCUtopia || creatingUser || verifying || sendingResetCode || resettingPassword
            ? <CircularProgress size={24} />
            : MODE_ITEMS[mode].button
        }
      </Button>
      {
        (mode === MODES.CUTOPIA_LOGIN || mode === MODES.CUTOPIA_SIGNUP)
        && (
          <div className="switch-container center-row">
            <span className="caption">{mode === MODES.CUTOPIA_LOGIN ? 'Don\'t have an account?' : 'Already have an account?'}</span>
            <span
              className="label"
              onClick={() => setMode(mode === MODES.CUTOPIA_LOGIN ? MODES.CUTOPIA_SIGNUP : MODES.CUTOPIA_LOGIN)}
            >
              {mode === MODES.CUTOPIA_SIGNUP ? 'Log In' : 'Sign Up'}
            </span>
          </div>
        )
      }
    </div>
  );
};
export default observer(LoginPanel);
