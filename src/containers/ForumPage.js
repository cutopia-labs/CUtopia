import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './ForumPage.css';
import { CoursePanel, SearchPanel } from '../components/forum';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';

const ForumPage = () => {
  const user = useContext(UserContext);
  const [courseId, setCourseId] = useState('AIST3010');
  return (
    <div className="forum-page row">
      <SearchPanel />
      <CoursePanel courseId={courseId} />
    </div>
  );
};

export default observer(ForumPage);
