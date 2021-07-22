import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import TimeTablePanel from '../templates/TimeTablePanel';
import { PlannerContext } from '../../store';

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
      onImport={(parsedData) =>
        planner.setPlannerStore('plannerCourses', parsedData)
      }
      onClear={() => planner.clearPlannerCourses()}
      selections={planner.plannerList}
      onSelect={(key) => planner.updateCurrentPlanner(key)}
      selected={{
        key: planner.currentPlanner,
        label: planner.planners[planner.currentPlanner]?.label,
      }}
    />
  );
};

export default observer(PlannerTimeTable);
