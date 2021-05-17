import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './HomePage.css';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';

const HomePage = () => {
  const user = useContext(UserContext);
  return (
    <div className="homepage">
    </div>
  );
};

export default observer(HomePage);
