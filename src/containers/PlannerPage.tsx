import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchPanel } from '../components/forum';
import { PlannerContext } from '../store';
import Page from '../components/atoms/Page';
import PlannerTimeTable from '../components/planner/PlannerTimeTable';

const PlannerPage = () => {
  const planner = useContext(PlannerContext);

  return (
    <Page center padding>
      <SearchPanel />
      <PlannerTimeTable />
    </Page>
  );
};

export default observer(PlannerPage);
