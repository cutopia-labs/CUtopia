import { useState, useRef, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';

import Draggable from 'react-draggable';
import { Fab } from '@material-ui/core';
import '../../styles/pages/PlannerPage.module.scss';
import { BsList } from 'react-icons/bs';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SearchPanel from '../../components/organisms/SearchPanel';
import Page from '../../components/atoms/Page';
import PlannerTimetable from '../../components/planner/PlannerTimetable';
import PlannerCart from '../../components/planner/PlannerCart';

import useMobileQuery from '../../hooks/useMobileQuery';
import authenticatedRoute from '../../components/molecules/authenticatedRoute';

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

const PlannerMobileFab: FC<PlannerMobileFabProps> = ({
  targetMode,
  setMode,
}) => {
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

const PlannerPage: FC = () => {
  const router = useRouter();
  const { courseId: queryCourseId, sid: shareId } = router.query;
  const isMobile = useMobileQuery();

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
            <div className="plannerCart-column secondary-column">
              <PlannerCart />
            </div>
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
      case PlannerMode.CART:
        return (
          <div className="plannerCart-column secondary-column">
            <PlannerCart />
          </div>
        );
    }
  };

  useEffect(() => {
    if (isMobile && shareId) {
      if (mode !== PlannerMode.TIMETABLE) {
        setMode(PlannerMode.TIMETABLE);
      }
    }
  }, [shareId, mode]);

  return (
    <>
      <Page className="planner-page" center padding>
        <Head>
          <title>{'Course Planner - CUtopia'}</title>
        </Head>
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

export default observer(authenticatedRoute(PlannerPage));
