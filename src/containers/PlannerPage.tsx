import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerPage.scss';
import { useTitle } from 'react-use';
import SearchPanel from '../components/organisms/SearchPanel';
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

const PlannerPage = () => {
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
            <div className="planner-cart-column secondary-column">
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
