import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchPanel } from '../components/forum';
import TimeTablePanel from '../components/templates/TimeTablePanel';
import { PlannerContext } from '../store';
import Page from '../components/atoms/Page';

const PlannerPage = () => {
  const planner = useContext(PlannerContext);

  return (
    <Page center padding>
      <SearchPanel />
      <TimeTablePanel
        title="My Schedule"
        courses={planner.plannerCourses}
        onImport={(parsedData) => planner.setAndSavePlannerCourses(parsedData)}
        onClear={() => planner.clearPlannerCourses()}
      />
    </Page>
  );
};

export default observer(PlannerPage);
