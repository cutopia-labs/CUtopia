import { useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';

import { BsChat } from 'react-icons/bs';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { ChatBubbleOutline, Edit, Share } from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { GetStaticPaths } from 'next';
import Head from 'next/head';
import clsx from 'clsx';
import styles from '../../styles/components/review/CoursePanel.module.scss';
import { validCourse } from '../../helpers';
import { useUser, useView } from '../../store';
import useMobileQuery from '../../hooks/useMobileQuery';
import { getSimilarCourses } from '../../helpers/getCourses';
import FeedCard from '../../components/molecules/FeedCard';
import TabsContainer from '../../components/molecules/TabsContainer';
import CourseCard from '../../components/review/CourseCard';
import CourseReviews from '../../components/review/CourseReviews';
import CourseComments from '../../components/review/CourseComments';
import { CourseInfo } from '../../types';
import Page from '../../components/atoms/Page';
import authenticatedRoute from '../../components/molecules/authenticatedRoute';
import ReviewEditPanel from '../../components/review/ReviewEditPanel';

const MENU_ITEMS = [
  {
    label: 'Reviews',
    icon: <ChatBubbleOutline />,
  },
  {
    label: 'Comments',
    icon: <BsChat />,
  },
];

type Props = {
  courseInfo: CourseInfo;
};

const CoursePanel: FC<Props> = ({ courseInfo }) => {
  const router = useRouter();
  console.log(router.query);
  const { courseId, rid, mode } = router.query as {
    courseId?: string;
    rid?: string; // review Id (query param)
    mode?: string; // i.e. 'edit' (query param)
  };
  const isMobile = useMobileQuery();
  const view = useView();
  const user = useUser();
  const [similarCourses, setSimilarCourse] = useState([]);
  const [FABOpen, setFABOpen] = useState(false);
  const [FABHidden, setFABHidden] = useState(!isMobile);
  const [tab, setTab] = useState('Reviews');

  const FAB_GROUP_ACTIONS = Object.freeze([
    {
      icon: <Share />,
      name: 'Share',
      action: () => {
        copy(window.location.href);
        view.setSnackBar('Copied share link to clipboard!');
      },
    },
  ]);

  const fetchSimilarCourses = async courseId => {
    setSimilarCourse(await getSimilarCourses(courseId));
  };

  const writeReview = () =>
    router.push(`/review/${courseId}?mode=edit`, undefined, { shallow: true });

  useEffect(() => {
    if (validCourse(courseId)) {
      user.saveHistory(courseId);
      fetchSimilarCourses(courseId);
    }
  }, [courseId]);

  if (mode == 'edit') return <ReviewEditPanel courseInfo={courseInfo} />;

  return (
    <Page className={styles.reviewPage} center padding>
      <Head>
        <title>{`${courseId} Reviews - ${courseInfo.title} - CUtopia`}</title>
      </Head>
      <div className={clsx(styles.coursePanelContainer, 'grid-auto-row')}>
        <div className={clsx(styles.coursePanel, 'panel card')}>
          <CourseCard
            courseInfo={courseInfo}
            loading={false}
            style={styles.courseCard}
          />
          <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
        </div>
        {tab == 'Reviews' && (
          <CourseReviews
            courseId={courseId}
            reviewId={rid}
            courseInfo={courseInfo}
            courseInfoLoading={false}
            isMobile={isMobile}
            FABHidden={FABHidden}
            setFABHidden={setFABHidden}
          />
        )}
        {tab == 'Comments' && <CourseComments courseId={courseId} />}
        <SpeedDial
          ariaLabel="SpeedDial"
          hidden={!isMobile || FABHidden || tab == 'Comments'}
          icon={<SpeedDialIcon onClick={writeReview} openIcon={<Edit />} />}
          onClose={() => setFABOpen(false)}
          onOpen={() => setFABOpen(true)}
          open={FABOpen}
          className={styles.coursePanelFab}
        >
          {FAB_GROUP_ACTIONS.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      </div>
      <div className="secondary-column sticky">
        {!isMobile && (
          <FeedCard
            title="Suggestions"
            courses={similarCourses}
            onItemClick={course => router.push(`/review/${course.courseId}`)}
          />
        )}
      </div>
    </Page>
  );
};

// SSR to get course info
export const getStaticProps = async ({ params }) => {
  const { courses } = await import('../../../data/coursesLoader');
  return {
    props: {
      courseInfo: courses[params.courseId],
    },
  };
};

// Get all valid paths to prerender (i.e. valid courseId)
export const getStaticPaths: GetStaticPaths<{}> = async () => {
  const courses = Object.values(await import('../../../data/courses.json'));
  return {
    paths: [...courses]
      .filter(cid => typeof cid === 'string')
      .map(cid => ({
        params: {
          courseId: cid,
        },
      })),
    fallback: false,
  };
};

export default observer(authenticatedRoute(CoursePanel));