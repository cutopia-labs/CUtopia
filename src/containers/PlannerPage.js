import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerPage.css';
import { CoursePanel, SearchPanel } from '../components/forum';
import { PlannerCart } from '../components/planner';
import { UserContext } from '../store';
import { GET_USER } from '../constants/queries';

const PlannerPage = () => {
  const user = useContext(UserContext);
  const [courseId, setCourseId] = useState('AIST3010');
  return (
    <div className="forum-page row">
      <SearchPanel />
      <PlannerCart />
      <CoursePanel />
    </div>
  );
};

export default observer(PlannerPage);
