import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import TimeTablePanel from '../templates/TimeTablePanel';
import { PlannerContext } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';

type PlannerTimeTableProps = {
  className?: string;
};

const PlannerTimeTable = ({ className }: PlannerTimeTableProps) => {
  const planner = useContext(PlannerContext);

  return (
    <TimeTablePanel
      className={className}
      courses={planner.plannerCourses}
      previewCourse={planner.previewPlannerCourse}
      onImport={(parsedData) => planner.setStore('plannerCourses', parsedData)}
      onClear={() => planner.clearPlannerCourses()}
      selections={planner.plannerList}
      onSelect={(key) => planner.updateCurrentPlanner(key)}
      selected={{
        key: planner.currentPlanner,
        label:
          planner.planners[planner.currentPlanner]?.label ||
          PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
      }}
      setLabel={(label: string) => planner.setPlannerLabel(label)}
      deleteTable={(key: number) => planner.deletePlanner(key)}
    />
  );
};

export default observer(PlannerTimeTable);
