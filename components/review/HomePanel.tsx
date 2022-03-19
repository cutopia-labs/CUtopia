import { useState, useContext, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ForumOutlined,
  ThumbUpOutlined,
  WhatshotOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';

import { useTitle } from 'react-use';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import styles from '../../styles/components/review/HomePanel.module.scss';
import GradeIndicator from '../atoms/GradeIndicator';
import { RATING_FIELDS } from '../../constants';
import {
  TOP_RATED_COURSES_QUERY,
  POPULAR_COURSES_QUERY,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import ListItem from '../molecules/ListItem';
import Badge from '../atoms/Badge';
import ChipsRow from '../molecules/ChipsRow';
import TabsContainer from '../molecules/TabsContainer';
import {
  PopularCourse,
  RatingField,
  RecentReview,
  TopRatedCourse,
} from '../../types';

import { UserContext, ViewContext } from '../../store';
import { getMMMDDYY } from '../../helpers/getTime';
import Footer from '../molecules/Footer';
import FeedCard from '../molecules/FeedCard';
import { getRandomGeCourses } from '../../helpers/getCourses';
import Card from '../atoms/Card';
import { LAZY_LOAD_BUFFER, REVIEWS_PER_PAGE } from '../../constants/configs';
import useDebounce from '../../hooks/useDebounce';
import { getRecentReviewQuery } from '../../helpers/dynamicQueries';

type ReviewHomeTab = 'Recents' | 'Top Rated' | 'Popular';

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
  category: RatingField;
};

const RecentReviewCard = ({
  review,
  onClick,
  category,
}: RecentReviewCardProps) => {
  return (
    <ListItem
      className="recent-review card"
      title={review.courseId}
      noBorder
      caption={`By ${review.username || 'Anonymous'} on ${getMMMDDYY(
        review.createdAt
      )}`}
      right={<GradeIndicator grade={review[category]?.grade} />}
      onClick={() => onClick(`${review.courseId}/${review.createdAt}`)}
    >
      <span className="recent-review-text ellipsis-text">
        {review[category]?.text}
      </span>
    </ListItem>
  );
};

type RecentReviewListProps = {
  visible: boolean;
  category: RatingField;
};

const RecentReviewList = ({ visible, category }: RecentReviewListProps) => {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const { current } = useRef<{
    page: number | null;
    stall: boolean;
  }>({ page: 0, stall: false });
  const router = useRouter();
  const view = useContext(ViewContext);

  useEffect(() => {
    setReviews([]); // if come from react nav, it gonna set empty arr to be empty again
    current.stall = true;
    current.page = 0;
  }, [category]);

  useEffect(() => {
    const now = new Date();
    console.log(`${reviews.length} ${now} ${now.getMilliseconds()}`);
  }, [reviews]);

  const { loading: recentReviewsLoading, refetch: getRecentReviews } = useQuery<
    any,
    any
  >(getRecentReviewQuery(category), {
    variables: {
      page: 0,
    },
    onCompleted: async data => {
      if (current.page) {
        setReviews(prevReviews =>
          prevReviews
            .concat(data.reviews)
            .filter(
              (v, i, a) => a.findIndex(m => v.createdAt === m.createdAt) === i
            )
        );
      } else {
        if (current.stall) {
          current.stall = false;
        }
        setReviews(data.reviews);
      }
      if ((data?.reviews?.length || 0) < REVIEWS_PER_PAGE) {
        current.page = null;
      } else {
        current.page += 1;
      }
    },
    onError: view.handleError,
    notifyOnNetworkStatusChange: true,
  });

  const listenToScroll = useDebounce(async () => {
    const distanceFromBottom =
      document.documentElement.scrollHeight -
      document.documentElement.scrollTop -
      window.innerHeight;
    console.log(`Distance: ${distanceFromBottom}`);
    if (distanceFromBottom <= LAZY_LOAD_BUFFER) {
      // Fetch more here;
      console.log(`page: ${current.page} stall: ${current.stall}`);
      if (current.page && !current.stall) {
        console.log('Refetching');
        getRecentReviews({ page: current.page });
      }
    }
  }, 300);

  useEffect(() => {
    window.addEventListener('scroll', listenToScroll, true);
    return () => {
      console.log(`Removed listener ${category}`);
      window.removeEventListener('scroll', listenToScroll, true);
    };
  }, [visible, category]);

  if (!visible) {
    return null;
  }
  return (
    <>
      <div className="grid-auto-row">
        {reviews.map(review => (
          <RecentReviewCard
            key={review.createdAt}
            review={review}
            onClick={id => router.push(`/review/${id}`)}
            category={category}
          />
        ))}
        {recentReviewsLoading && <Loading />}
      </div>
      {current.page === null && <Footer />}
    </>
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
          href={`/review/${course.courseId}`}
        >
          <ListItem
            left={<span className="ranking-label center-box">{i + 1}</span>}
            right={
              course.numReviews ? (
                <Badge index={0} text={`${course.numReviews} reviews`} />
              ) : (
                <GradeIndicator grade={course[sortKey]} />
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
  useTitle('Course Reviews - CUtopia');
  const [tab, setTab] = useState<ReviewHomeTab>('Recents');
  const [sortKey, setSortKey] = useState('overall');
  const [feedCourses, setFeedCourse] = useState([]);
  const router = useRouter();
  const view = useContext(ViewContext);
  const user = useContext(UserContext);

  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(
    POPULAR_COURSES_QUERY,
    {
      skip: tab !== 'Popular',
      onError: view.handleError,
    }
  );
  const { data: rankedCourses, loading: rankedCoursesLoading } = useQuery(
    TOP_RATED_COURSES_QUERY,
    {
      variables: {
        criteria: sortKey,
      },
      skip: tab !== 'Top Rated',
      onError: view.handleError,
    }
  );

  useEffect(() => {
    const fetchFeedCourses = async () => {
      setFeedCourse(await getRandomGeCourses());
    };
    fetchFeedCourses();
  }, []);

  return (
    <>
      <div className="panel review-home-panel center-row grid-auto-row">
        <TabsContainer items={MENU_ITEMS} selected={tab} onSelect={setTab} />
        {(tab === 'Top Rated' || tab === 'Recents') && (
          <ChipsRow
            style={styles.homeChipsRow}
            items={[
              tab === 'Top Rated' ? 'overall' : '',
              ...RATING_FIELDS,
            ].filter(item => item)}
            select={tab === 'Top Rated' ? sortKey : user.recentReviewCategory}
            setSelect={selected =>
              tab === 'Top Rated'
                ? setSortKey(selected)
                : user.setStore('recentReviewCategory', selected)
            }
          />
        )}
        <RecentReviewList
          visible={tab === 'Recents'}
          category={user.recentReviewCategory}
        />
        <RankingCard
          rankList={rankedCourses?.ranking?.rankedCourses}
          sortKey={sortKey}
          loading={rankedCoursesLoading}
        />
        <RankingCard
          rankList={popularCourses?.ranking?.rankedCourses}
          loading={popularCoursesLoading}
        />
        {!(
          popularCoursesLoading ||
          rankedCoursesLoading ||
          tab === 'Recents'
        ) && <Footer />}
      </div>
      <div className="secondary-column sticky">
        <Card title="Recents">
          <ChipsRow
            className="recent-chips"
            chipClassName="chip-fill"
            items={user.searchHistory}
            onItemClick={item => router.push(`/review/${item}`)}
          />
        </Card>
        <FeedCard
          title="Suggestions"
          courses={feedCourses}
          onItemClick={course => router.push(`/review/${course.courseId}`)}
        />
      </div>
    </>
  );
};

export default observer(HomePanel);
