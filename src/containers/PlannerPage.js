import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerPage.css';
import { SearchPanel } from '../components/forum';
import TimeTablePanel from '../components/TimeTablePanel';
import { UserContext } from '../store';

const PlannerPage = () => {
  const user = useContext(UserContext);

  return (
    <div className="planner-page center-page page row">
      <SearchPanel />
      <TimeTablePanel
        className="planner-timetable margin-card"
        title="My Schedule"
        courses={user.plannerCourses}
        onImport={parsedData => user.setAndSavePlannerCourses(parsedData)}
        onClear={() => user.clearPlannerCourses()}
      />
    </div>
  );
};

export default observer(PlannerPage);
