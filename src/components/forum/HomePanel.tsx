import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThumbUpOutlined, WhatshotOutlined } from '@material-ui/icons';
import { useQuery } from '@apollo/client';

import './HomePanel.scss';
import GradeIndicator from '../atoms/GradeIndicator';
import { RATING_FIELDS } from '../../constants/states';
import {
  RECENT_REVIEWS_QUERY,
  TOP_RATED_COURSES_QUERY,
  POPULAR_COURSES_QUERY,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import ListItem from '../molecules/ListItem';
import Badge from '../atoms/Badge';
import ChipsRow from '../molecules/ChipsRow';
import TabsContainer from '../molecules/TabsContainer';
import { PopularCourse, TopRatedCourse } from '../../types';

import { NotificationContext } from '../../store';

const MENU_ITEMS = [
  {
    label: 'Top Rated',
    icon: <ThumbUpOutlined />,
  },
  {
    label: 'Popular',
    icon: <WhatshotOutlined />,
  },
];

type RankingCardProps = {
  rankList?: PopularCourse[] | TopRatedCourse[];
  headerTitle?: string;
  sortKey?: string;
  loading?: boolean;
};

const RankingCard = ({
  rankList,
  headerTitle,
  sortKey,
  loading,
}: RankingCardProps) => {
  if (loading) return <Loading />;
  if (!rankList || !rankList.length) return null;
  return (
    <div className="ranking-card card">
      {rankList.map((course: PopularCourse | TopRatedCourse, i: number) => (
        <Link
          key={`${headerTitle}-${course.courseId}`}
          to={`/review/${course.courseId}`}
        >
          <ListItem
            left={<span className="ranking-label center-box">{i + 1}</span>}
            right={
              course[sortKey] ? (
                <GradeIndicator grade={course[sortKey]} />
              ) : (
                <Badge index={0} text={`${course.numReviews} reviews`} />
              )
            }
            title={course.courseId}
            caption={course.course.title}
          />
        </Link>
      ))}
    </div>
  );
};

const HomePanel = () => {
  const [tab, setTab] = useState('Top Rated');
  const [sortKey, setSortKey] = useState('overall');
  const notification = useContext(NotificationContext);

  const { data: reviews, loading: recentReviewsLoading } = useQuery(
    RECENT_REVIEWS_QUERY,
    {
      skip: tab !== 'Recent',
      onError: notification.handleError,
    }
  );
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(
    POPULAR_COURSES_QUERY,
    {
      skip: tab !== 'Popular',
      onError: notification.handleError,
    }
  );
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(
    TOP_RATED_COURSES_QUERY,
    {
      variables: {
        criteria: sortKey,
      },
      skip: tab !== 'Top Rated',
      onError: notification.handleError,
    }
  );
  return (
    <div className="panel review-home-panel center-row">
      <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
      {tab === 'Top Rated' && (
        <ChipsRow
          items={['overall', ...RATING_FIELDS]}
          select={sortKey}
          setSelect={setSortKey}
        />
      )}
      <RankingCard
        rankList={topRatedCourses?.ranking?.topRatedCourses}
        sortKey={sortKey}
        loading={topRatedCoursesLoading}
      />
      <RankingCard
        rankList={popularCourses?.ranking?.popularCourses}
        loading={popularCoursesLoading}
      />
    </div>
  );
};

export default HomePanel;
