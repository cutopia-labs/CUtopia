import { useState, useRef, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';

import Draggable from 'react-draggable';
import { Fab } from '@material-ui/core';
import '../../styles/pages/PlannerPage.module.scss';
import { BsList } from 'react-icons/bs';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { GetStaticPaths } from 'next';
import Head from 'next/head';
import SearchPanel from '../../components/organisms/SearchPanel';
import Page from '../../components/atoms/Page';
import PlannerTimetable from '../../components/planner/PlannerTimetable';
import PlannerCart from '../../components/planner/PlannerCart';

import TimetableOverviewCard from '../../components/planner/TimetableOverviewCard';
import useMobileQuery from '../../hooks/useMobileQuery';
import authenticatedRoute from '../../components/molecules/authenticatedRoute';
import { CourseInfo } from '../../types';

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

type Props = {
  courseInfo?: CourseInfo;
};

const PlannerPage: FC<Props> = ({ courseInfo }) => {
  const router = useRouter();
  const isPlannerShare =
    router.pathname.includes('planner/share') && router.query.shareId;
  const isMobile = useMobileQuery();

  console.log(`Props: ${courseInfo?.courseId}`);

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
              <TimetableOverviewCard />
              <PlannerCart />
            </div>
          </>
        );
      case PlannerMode.TIMETABLE:
        return <PlannerTimetable />;
      case PlannerMode.CART:
        return (
          <div className="plannerCart-column secondary-column">
            <TimetableOverviewCard />
            <PlannerCart />
          </div>
        );
    }
  };

  useEffect(() => {
    if (isMobile && isPlannerShare) {
      if (mode !== PlannerMode.TIMETABLE) {
        setMode(PlannerMode.TIMETABLE);
      }
    }
  }, [isPlannerShare, mode]);

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

// SSR to get course info
export const getStaticProps = async ({ params }) => {
  const { courses } = await import('../../../data/coursesLoader');
  return {
    props: params?.courseId
      ? {
          courseInfo: courses[params?.courseId[0]],
        }
      : {}, // For index, the props are empty
  };
};

// Get all valid paths to prerender (i.e. valid courseId)
export const getStaticPaths: GetStaticPaths<any> = async () => {
  const courses = Object.values(await import('../../../data/courses.json'));
  const paths = [
    {
      // the index path
      params: {
        courseId: false,
      },
    },
    // the courses path
    ...[...courses]
      .filter(cid => typeof cid === 'string')
      .map(cid => ({
        params: {
          courseId: [cid],
        },
      })),
  ];
  return {
    paths,
    fallback: false,
  };
};

export default observer(authenticatedRoute(PlannerPage));
