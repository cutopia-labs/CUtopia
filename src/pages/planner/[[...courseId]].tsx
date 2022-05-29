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
import { CourseInfo, CourseSection } from '../../types';
import { getAttrs } from '../../helpers';
import {
  CURRENT_TERM,
  PLANNER_COURSE_INFO_ATTRS,
} from '../../constants/configs';

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
  const { courseId: queryCourseId, sid: shareId } = router.query;
  const isMobile = useMobileQuery();
  if (queryCourseId && courseInfo) {
    courseInfo.courseId = queryCourseId[0];
  }
  console.log(`Props: ${courseInfo?.courseId} w/ sid: ${shareId}`);

  const [mode, setMode] = useState<PlannerMode>(
    isMobile ? PlannerMode.TIMETABLE : PlannerMode.INITIAL
  );

  const renderContent = () => {
    switch (mode) {
      case PlannerMode.INITIAL:
        return (
          <>
            <SearchPanel courseInfo={courseInfo} />
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

// SSR to get course info
export const getStaticProps = async ({ params }) => {
  if (!params?.courseId) return { props: {} };
  const { courses } = await import('../../../data/coursesLoader');
  /* Pre Processing */
  // Get only selected attrs
  const courseInfo = getAttrs(
    courses[params.courseId[0]],
    ...PLANNER_COURSE_INFO_ATTRS
  ) as CourseInfo;
  // Get only current term's sections
  courseInfo.sections =
    CURRENT_TERM in courseInfo.terms
      ? (Object.entries(courseInfo.terms[CURRENT_TERM]).map(
          ([k, v]: [k: string, v: Record<string, any>]) => ({
            name: k,
            ...v,
          })
        ) as CourseSection[])
      : null;
  // Remove terms info to save space
  delete courseInfo.terms;
  return {
    props: {
      courseInfo,
    },
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
