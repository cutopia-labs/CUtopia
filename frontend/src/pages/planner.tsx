import { useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';
import Draggable from 'react-draggable';
import { Fab } from '@mui/material';
import { AiOutlineCalendar } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Head from 'next/head';
import clsx from 'clsx';
import { RiShoppingCartLine } from 'react-icons/ri';

import styles from '../styles/pages/PlannerPage.module.scss';
import SearchPanel from '../components/organisms/SearchPanel';
import Page from '../components/atoms/Page';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import PlannerCart from '../components/planner/PlannerCart';
import authenticatedRoute from '../components/molecules/authenticatedRoute';
import useClickObserver from '../hooks/useClickObserver';
import { isMobileQuery } from '../helpers';

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
    icon: <RiShoppingCartLine />,
  },
  [PlannerMode.TIMETABLE]: {
    icon: <AiOutlineCalendar />,
  },
};

const PlannerMobileFab = ({ targetMode, setMode }: PlannerMobileFabProps) => {
  return (
    <Draggable bounds="parent" {...useClickObserver(() => setMode(targetMode))}>
      <Fab
        disableRipple
        id="plannerDraggableFabContainer"
        className={styles.plannerDraggableFabContainer}
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
  const { sid: shareId } = router.query;
  const isMobile = isMobileQuery();

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
            <div className={clsx(styles.plannerCartColumn, 'secondary-column')}>
              <PlannerCart />
            </div>
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
      case PlannerMode.CART:
        return (
          <>
            <PlannerTimetable hide />
            <div className={clsx(styles.plannerCartColumn, 'secondary-column')}>
              <PlannerCart />
            </div>
          </>
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
    <Page className={styles.plannerPage} center padding>
      <Head>
        <title>{'Course Planner - CUtopia'}</title>
      </Head>
      {renderContent()}
      {isMobile && (
        <PlannerMobileFab
          targetMode={
            mode === PlannerMode.CART ? PlannerMode.TIMETABLE : PlannerMode.CART
          }
          setMode={setMode}
        />
      )}
    </Page>
  );
};

export default authenticatedRoute(observer(PlannerPage));
