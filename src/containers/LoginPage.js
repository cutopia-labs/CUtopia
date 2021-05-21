import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './LoginPage.css';
import Logo from '../components/Logo';
import LoginPanel from '../components/user/LoginPanel';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';
import { MODES, LOGIN_STATES } from '../constants/states';

const LoginPage = () => {
  const user = useContext(UserContext);
  return (
    <div className="login-page">
      <div className="left">
        <Logo />
        <p className="banner-text">A few clicks away from quality course reviews</p>
      </div>
      <div className="right">
        <LoginPanel />
      </div>
    </div>
  );
};

export default observer(LoginPage);
