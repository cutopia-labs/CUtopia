import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import { UserContext } from '../../store';

import './TimeTablePanel.css';
import CourseList from './CourseList';
import { observer } from 'mobx-react-lite';

const TimeTablePanel = () => {
  const user = useContext(UserContext);
  const FUNCTION_BUTTONS = [
    {
      label: 'import',
      action: () => {},
    },
    {
      label: 'export',
      action: () => {},
    },
    {
      label: 'clear',
      action: () => user.clearPlannerCourses(),
    },
  ];
  return (
    <div className="time-table-panel card">
      <header className="center-row">
        <span className="title">My Schedule</span>
        <div className="btn-row center-row">
          {
            FUNCTION_BUTTONS.map(item => (
              <Button
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))
          }
        </div>
      </header>
      <CourseList courses={user.plannerCourses.slice()} />
    </div>
  );
};

export default observer(TimeTablePanel);
