import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerPage.scss';
import { CalendarToday, Search } from '@material-ui/icons';
import { useRouteMatch } from 'react-router-dom';
import { useTitle } from 'react-use';
import { SearchPanel } from '../components/forum';
import Page from '../components/atoms/Page';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import PlannerCart from '../components/planner/PlannerCart';

import { MIN_DESKTOP_WIDTH } from '../constants/configs';
import TimetableOverviewCard from '../components/planner/TimetableOverviewCard';

enum PlannerMode {
  INITIAL,
  SEARCH, // Mobile Only
  TIMETABLE, // Mobile Only
}

type PlannerMobileFabProps = {
  targetMode: PlannerMode;
  setMode: (mode: PlannerMode) => any;
};

const PLANNER_MOBILE_FAB_ITEM = {
  [PlannerMode.SEARCH]: {
    icon: <Search />,
  },
  [PlannerMode.TIMETABLE]: {
    icon: <CalendarToday />,
  },
};

const PlannerPage = () => {
  const isPlannerShare = useRouteMatch({
    path: '/planner/share/:shareId',
    strict: true,
    exact: true,
  });
  useTitle('Planner');
  const isMobile = window.matchMedia(
    `(max-width:${MIN_DESKTOP_WIDTH}px)`
  ).matches;

  console.log(`is Mobile ${isMobile}`);

  const [mode, setMode] = useState<PlannerMode>(
    isMobile ? PlannerMode.TIMETABLE : PlannerMode.INITIAL
  );

  const renderContent = () => {
    switch (mode) {
      case PlannerMode.INITIAL:
        return (
          <>
            <SearchPanel />
            <PlannerTimetable />
            <div className="secondary-column">
              <TimetableOverviewCard />
              <PlannerCart />
            </div>
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
    }
  };

  return (
    <Page className="planner-page" center padding>
      {renderContent()}
    </Page>
  );
};

export default observer(PlannerPage);
