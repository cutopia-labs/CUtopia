import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchPanel } from '../components/forum';
import TimeTablePanel from '../components/TimeTablePanel';
import { UserContext } from '../store';
import Page from '../components/Page';

const PlannerPage = () => {
  const user = useContext(UserContext);

  return (
    <Page>
      <SearchPanel />
      <TimeTablePanel
        title="My Schedule"
        courses={user.plannerCourses}
        onImport={parsedData => user.setAndSavePlannerCourses(parsedData)}
        onClear={() => user.clearPlannerCourses()}
      />
    </Page>
  );
};

export default observer(PlannerPage);
