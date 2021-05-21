import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './HomePage.css';
import LoginPage from './LoginPage';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';
import { MODES, LOGIN_STATES } from '../constants/states';

const HomePage = () => {
  const user = useContext(UserContext);
  return (
    <div className="homepage">
      <div>Logged In</div>
    </div>
  );
};

export default observer(HomePage);
