import { useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';
import { BsChat } from 'react-icons/bs';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { ChatBubbleOutline, Edit, Share } from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { GetStaticPaths } from 'next';
import clsx from 'clsx';
import { useQuery } from '@apollo/client';

import styles from '../../styles/components/review/CoursePanel.module.scss';
import { getAttrs, validCourse } from '../../helpers';
import { useUser, useView, useData } from '../../store';
import useMobileQuery from '../../hooks/useMobileQuery';
import FeedCard from '../../components/molecules/FeedCard';
import TabsContainer from '../../components/molecules/TabsContainer';
import CourseCard from '../../components/review/CourseCard';
import CourseReviews from '../../components/review/CourseReviews';
import CourseComments from '../../components/review/CourseComments';
import { CourseInfo } from '../../types';
import Page from '../../components/atoms/Page';
import authenticatedRoute from '../../components/molecules/authenticatedRoute';
import ReviewEditPanel from '../../components/review/ReviewEditPanel';
import { COURSE_INFO_QUERY } from '../../constants/queries';
import { REVIEW_COURSE_INFO_ATTRS } from '../../config';

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
  c: CourseInfo;
};

const CoursePanel: FC<Props> = ({ c: courseInfo }) => {
  const router = useRouter();
  const { courseId, rid, mode } = router.query as {
    courseId?: string;
    rid?: string; // review Id (query param)
    mode?: string; // i.e. 'edit' (query param)
  };
  courseInfo.courseId = courseId;
  const isMobile = useMobileQuery();
  const view = useView();
  const user = useUser();
  const data = useData();
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
  // Fetch course info
  const { data: courseRating, loading: courseRatingLoading } = useQuery(
    COURSE_INFO_QUERY,
    {
      skip: !courseId,
      ...(courseId && {
        variables: {
          courseId,
        },
      }),
      fetchPolicy: 'cache-first',
      onError: view.handleError,
    }
  );

  const fetchSimilarCourses = async (courseId: string) => {
    setSimilarCourse(await data.getSimilarCourses(courseId));
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
      <div className={clsx(styles.coursePanelContainer, 'grid-auto-row')}>
        <div className={clsx(styles.coursePanel, 'panel card')}>
          <CourseCard
            courseInfo={{
              ...courseInfo,
              ...courseRating?.courses[0],
            }}
            style={styles.courseCard}
          />
          <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
        </div>
        {tab == 'Reviews' && (
          <CourseReviews
            courseId={courseId}
            reviewId={rid}
            courseInfo={{
              ...courseInfo,
              ...courseRating?.courses[0],
            }}
            courseInfoLoading={courseRatingLoading}
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
  const { courses } = await import('../../../tools/coursesLoader');
  const courseInfo = getAttrs(
    courses[params.courseId],
    ...REVIEW_COURSE_INFO_ATTRS
  );
  return {
    props: {
      c: courseInfo,
    },
  };
};

// Get all valid paths to prerender (i.e. valid courseId)
export const getStaticPaths: GetStaticPaths<{}> = async () => {
  const courses = Object.values(
    await import('../../../data/derived/courses.json')
  );
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

export default authenticatedRoute(observer(CoursePanel));
