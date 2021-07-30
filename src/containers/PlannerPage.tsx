import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerPage.scss';
import { SearchPanel } from '../components/forum';
import { PlannerContext } from '../store';
import Page from '../components/atoms/Page';
import PlannerTimeTable from '../components/planner/PlannerTimeTable';
import PlannerCart from '../components/planner/PlannerCart';

const PlannerPage = () => {
  const planner = useContext(PlannerContext);

  return (
    <Page className="planner-page" center padding>
      <SearchPanel />
      <PlannerTimeTable />
      <PlannerCart />
    </Page>
  );
};

export default observer(PlannerPage);
