import { useState, useEffect, useContext, FC } from 'react';
import { useQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';
import { useTitle } from 'react-use';

import './CoursePanel.scss';

import { BsChat } from 'react-icons/bs';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { ChatBubbleOutline, Edit, Share } from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { validCourse } from '../../helpers';
import { COURSE_INFO_QUERY } from '../../constants/queries';
import { ViewContext, UserContext } from '../../store';
import useMobileQuery from '../../hooks/useMobileQuery';
import { getSimilarCourses } from '../../helpers/getCourses';
import FeedCard from '../molecules/FeedCard';
import TabsContainer from '../molecules/TabsContainer';
import CourseCard from './CourseCard';
import CourseReviews from './CourseReviews';
import CourseComments from './CourseComments';

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

const CoursePanel: FC = () => {
  const router = useRouter();
  const { id: courseId, reviewId } = router.query as {
    id?: string;
    reviewId?: string;
  };
  useTitle(`${courseId} Reviews - CUtopia`);
  const isMobile = useMobileQuery();
  const view = useContext(ViewContext);
  const user = useContext(UserContext);
  const [similarCourses, setSimilarCourse] = useState([]);
  const [FABOpen, setFABOpen] = useState(false);
  const [FABHidden, setFABHidden] = useState(!isMobile);
  const [tab, setTab] = useState('Reviews');

  // Fetch course info
  const { data: courseInfo, loading: courseInfoLoading } = useQuery(
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

  useEffect(() => {
    if (validCourse(courseId)) {
      user.saveHistory(courseId);
      fetchSimilarCourses(courseId);
    }
  }, [courseId]);

  return (
    <>
      <div className="course-panel-container grid-auto-row">
        <div className="course-panel panel card">
          <CourseCard
            courseInfo={{
              ...courseInfo?.courses[0],
              courseId,
            }}
            loading={courseInfoLoading}
          />
          <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
        </div>
        {tab == 'Reviews' && (
          <CourseReviews
            courseId={courseId}
            reviewId={reviewId}
            courseInfo={courseInfo?.courses[0]}
            courseInfoLoading={courseInfoLoading}
            isMobile={isMobile}
            FABHidden={FABHidden}
            setFABHidden={setFABHidden}
          />
        )}
        {tab == 'Comments' && <CourseComments courseId={courseId} />}
        <SpeedDial
          ariaLabel="SpeedDial"
          hidden={!isMobile || FABHidden || tab == 'Comments'}
          icon={
            <SpeedDialIcon
              onClick={() => router.push(`/review/${courseId}/compose`)}
              openIcon={<Edit />}
            />
          }
          onClose={() => setFABOpen(false)}
          onOpen={() => setFABOpen(true)}
          open={FABOpen}
          className="course-panel-fab"
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
    </>
  );
};

export default observer(CoursePanel);
