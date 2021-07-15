import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbUpOutlined, WhatshotOutlined } from '@material-ui/icons';
import { useQuery } from '@apollo/client';

import './HomePanel.css';
import GradeIndicator from '../GradeIndicator';
import { RATING_FIELDS } from '../../constants/states';
import {
  RECENT_REVIEWS_QUERY,
  TOP_RATED_COURSES_QUERY,
  POPULAR_COURSES_QUERY,
} from '../../constants/queries';
import Loading from '../Loading';
import ListItem from '../ListItem';
import Badge from '../Badge';
import ChipsRow from '../ChipsRow';
import TabsContainer from '../TabsContainer';
import { PopularCourse, TopRatedCourse } from '../../types';

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
            left={
              <span className="ranking-label center-flex-box">{i + 1}</span>
            }
            right={
              course[sortKey] ? (
                <GradeIndicator grade={course[sortKey]} />
              ) : (
                <Badge index={0} text={`${course.numReviews} reviews`} />
              )
            }
          >
            <div className="search-list-item column">
              <span className="title">{course.courseId}</span>
              <span className="caption">{course.course.title}</span>
            </div>
          </ListItem>
        </Link>
      ))}
    </div>
  );
};

const HomePanel = () => {
  const [tab, setTab] = useState('Top Rated');
  const [sortKey, setSortKey] = useState('overall');

  const { data: reviews, loading: recentReviewsLoading } = useQuery(
    RECENT_REVIEWS_QUERY,
    {
      skip: tab !== 'Recent',
    }
  );
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(
    POPULAR_COURSES_QUERY,
    {
      skip: tab !== 'Popular',
    }
  );
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(
    TOP_RATED_COURSES_QUERY,
    {
      variables: {
        criteria: sortKey,
      },
      skip: tab !== 'Top Rated',
    }
  );
  return (
    <div className="panel review-home-panel center-row">
      <TabsContainer tabs={MENU_ITEMS} selected={tab} onSelect={setTab}>
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
      </TabsContainer>
    </div>
  );
};

export default HomePanel;
