import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './LoginPage.css';
import Logo from '../components/Logo';
import LoginPanel from '../components/user/LoginPanel';
import Discusssing from '../images/talk.png';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';
import { MODES, LOGIN_STATES } from '../constants/states';

const IntroBanner = ({ title, text }) => (
  <>
    <p className="banner-title" col>{title}</p>
    <p className="banner-text" col>{text}</p>
  </>
);

const LoginPage = () => {
  const user = useContext(UserContext);
  return (
    <div className="login-page">
      <div className="left">
        <Logo className="logo" />
        <div className="banner-box">
          <p className="banner-big-title">Choose the most suitable course here!</p>
          <IntroBanner title="Comment on courses" text="Give and look at comments" />
          <IntroBanner title="Plan your timetable" text="Add courses to our planner" />
          <IntroBanner title="Sign up with your SID" text="Contribute to look at more comments" />
          <img
            col
            className="banner-image"
            src={Discusssing}
            alt=""
          />
        </div>
      </div>
      <div className="right">
        <LoginPanel />
      </div>
    </div>
  );
};

export default observer(LoginPage);
