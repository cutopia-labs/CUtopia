import { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import Draggable from 'react-draggable';
import { Fab } from '@material-ui/core';
import './PlannerPage.scss';
import { useTitle } from 'react-use';
import { BsList } from 'react-icons/bs';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { useRouteMatch } from 'react-router-dom';
import SearchPanel from '../components/organisms/SearchPanel';
import Page from '../components/atoms/Page';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import PlannerCart from '../components/planner/PlannerCart';

import { MIN_DESKTOP_WIDTH } from '../constants/configs';
import TimetableOverviewCard from '../components/planner/TimetableOverviewCard';

enum PlannerMode {
  INITIAL,
  CART, // Mobile Only
  TIMETABLE, // Mobile Only
}

type PlannerMobileFabProps = {
  targetMode: PlannerMode;
  setMode: (mode: PlannerMode) => any;
};

const PLANNER_MOBILE_FAB_ITEM = {
  [PlannerMode.CART]: {
    icon: <BsList />,
  },
  [PlannerMode.TIMETABLE]: {
    icon: <AiTwotoneCalendar />,
  },
};

const PlannerMobileFab = ({ targetMode, setMode }: PlannerMobileFabProps) => {
  const isDraggingRef = useRef(false);
  return (
    <Draggable
      bounds="parent"
      onDrag={() => {
        isDraggingRef.current = true;
      }}
      onStop={() => {
        // i.e. not dragging but onclick
        if (!isDraggingRef.current) {
          setMode(targetMode);
        }
        isDraggingRef.current = false;
      }}
    >
      <Fab
        disableRipple
        id="planner-draggable-fab-container"
        color="primary"
        aria-label="edit"
      >
        {PLANNER_MOBILE_FAB_ITEM[targetMode]?.icon}
      </Fab>
    </Draggable>
  );
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
            <div className="planner-cart-column secondary-column">
              <TimetableOverviewCard />
              <PlannerCart />
            </div>
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
      case PlannerMode.CART:
        return (
          <div className="planner-cart-column secondary-column">
            <TimetableOverviewCard />
            <PlannerCart />
          </div>
        );
    }
  };

  useEffect(() => {
    if (isPlannerShare) {
      if (mode !== PlannerMode.TIMETABLE) {
        setMode(PlannerMode.TIMETABLE);
      }
    }
  }, [isPlannerShare, mode]);

  return (
    <>
      <Page className="planner-page" center padding>
        {renderContent()}
      </Page>
      {isMobile && (
        <PlannerMobileFab
          targetMode={
            mode === PlannerMode.CART ? PlannerMode.TIMETABLE : PlannerMode.CART
          }
          setMode={setMode}
        />
      )}
    </>
  );
};

export default observer(PlannerPage);
