import { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  ForumOutlined,
  ThumbUpOutlined,
  WhatshotOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';

import './HomePanel.scss';
import { useTitle } from 'react-use';
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
import { PopularCourse, RecentReview, TopRatedCourse } from '../../types';

import { ViewContext } from '../../store';
import { getMMMDDYY } from '../../helpers/getTime';
import Footer from '../molecules/Footer';

const MENU_ITEMS = [
  {
    label: 'Recents',
    icon: <ForumOutlined />,
  },
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

type RecentReviewCardProps = {
  review: RecentReview;
  onClick: (id: string) => any;
};

const RecentReviewCard = ({ review, onClick }: RecentReviewCardProps) => {
  return (
    <ListItem
      className="recent-review card"
      title={review.courseId}
      noBorder
      caption={`By ${review.username || 'Anonymous'} on ${getMMMDDYY(
        review.createdDate
      )}`}
      right={<GradeIndicator grade={review.overall} />}
      onClick={() => onClick(`${review.courseId}/${review.createdDate}`)}
    >
      <span className="recent-review-text">{review.grading.text}</span>
    </ListItem>
  );
};

type RecentReviewListProps = {
  reviews: RecentReview[];
  loading: boolean;
};

const RecentReviewList = ({ reviews, loading }: RecentReviewListProps) => {
  const history = useHistory();
  if (loading) return <Loading />;
  if (!reviews || !reviews.length) return null;
  return (
    <div className="grid-auto-row">
      {reviews.map((review) => (
        <RecentReviewCard
          key={review.createdDate}
          review={review}
          onClick={(id) => history.push(`/review/${id}`)}
        />
      ))}
    </div>
  );
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
  useTitle('Review');
  const [tab, setTab] = useState('Recents');
  const [sortKey, setSortKey] = useState('overall');
  const view = useContext(ViewContext);

  const { data: reviewsData, loading: recentReviewsLoading } = useQuery<{
    reviews: {
      reviews: RecentReview[];
    };
  }>(RECENT_REVIEWS_QUERY, {
    skip: tab !== 'Recents',
    onError: view.handleError,
  });
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(
    POPULAR_COURSES_QUERY,
    {
      skip: tab !== 'Popular',
      onError: view.handleError,
    }
  );
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(
    TOP_RATED_COURSES_QUERY,
    {
      variables: {
        criteria: sortKey,
      },
      skip: tab !== 'Top Rated',
      onError: view.handleError,
    }
  );
  return (
    <>
      <div className="panel review-home-panel center-row grid-auto-row">
        <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
        {tab === 'Top Rated' && (
          <ChipsRow
            items={['overall', ...RATING_FIELDS]}
            select={sortKey}
            setSelect={setSortKey}
          />
        )}
        <RecentReviewList
          reviews={reviewsData?.reviews?.reviews}
          loading={recentReviewsLoading}
        />
        <RankingCard
          rankList={topRatedCourses?.ranking?.topRatedCourses}
          sortKey={sortKey}
          loading={topRatedCoursesLoading}
        />
        <RankingCard
          rankList={popularCourses?.ranking?.popularCourses}
          loading={popularCoursesLoading}
        />
        {!(
          recentReviewsLoading ||
          popularCoursesLoading ||
          topRatedCoursesLoading
        ) && <Footer />}
      </div>
      <div className="secondary-column"></div>
    </>
  );
};

export default HomePanel;
