import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './ForumPage.css';
import { CoursePanel, SearchPanel } from '../components/forum';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';

const ForumPage = () => {
  const user = useContext(UserContext);
  return (
    <div className="forum-page row">
      <SearchPanel />
      <CoursePanel />
    </div>
  );
};

export default observer(ForumPage);
