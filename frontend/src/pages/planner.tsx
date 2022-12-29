import { useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';
import Draggable from 'react-draggable';
import { Fab } from '@mui/material';
import { AiOutlineCalendar } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { RiShoppingCartLine } from 'react-icons/ri';

import styles from '../styles/pages/PlannerPage.module.scss';
import SearchPanel from '../components/organisms/SearchPanel';
import Page from '../components/atoms/Page';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import PlannerCart from '../components/planner/PlannerCart';
import authenticatedRoute from '../components/molecules/authenticatedRoute';
import useClickObserver from '../hooks/useClickObserver';
import useMobileQuery from '../hooks/useMobileQuery';

enum PlannerMode {
  INIT,
  DESKTOP, // Desktop Only
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
  const isMobile = useMobileQuery();

  const [mode, setMode] = useState<PlannerMode>(PlannerMode.INIT);

  const renderContent = () => {
    switch (mode) {
      case PlannerMode.INIT:
        return null;
      case PlannerMode.DESKTOP:
        return (
          <>
            <SearchPanel />
            <PlannerTimetable />
            <PlannerCart />
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
      case PlannerMode.CART:
        return (
          <>
            <PlannerTimetable hide />
            <PlannerCart />
          </>
        );
    }
  };

  /** Switch mode based on media */
  useEffect(() => {
    if (typeof isMobile === 'boolean') {
      setMode(isMobile ? PlannerMode.TIMETABLE : PlannerMode.DESKTOP);
    }
  }, [isMobile]);

  /** Set to timetable mode when accepting shareId for mobile */
  useEffect(() => {
    if (isMobile && shareId) {
      if (mode !== PlannerMode.TIMETABLE) {
        setMode(PlannerMode.TIMETABLE);
      }
    }
  }, [shareId, mode, isMobile]);

  return (
    <Page className={styles.plannerPage} center padding>
      <Head>
        <title>{'CUHK Timetable Planner - CUtopia'}</title>
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
