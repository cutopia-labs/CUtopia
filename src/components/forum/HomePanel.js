import React, { useState } from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  ExpandMore,
  Sort, SortOutlined, ThumbUp, ThumbUpOutlined, Whatshot, WhatshotOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import {
  Button, IconButton, Menu, MenuItem,
} from '@material-ui/core';

import './HomePanel.css';
import GradeIndicator from '../GradeIndicator';
import { RATING_FIELDS } from '../../constants/states';
import { RECENT_REVIEWS_QUERY, TOP_RATED_COURSES_QUERY, POPULAR_COURSES_QUERY } from '../../constants/queries';
import Loading from '../Loading';
import ListItem from '../ListItem';
import Badge from '../Badge';
import BottomBorderRow from '../BottomBorderRow';
import ChipsRow from '../ChipsRow';

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

const RankingCard = ({
  rankList, headerTitle, sortKey, loading,
}) => {
  if (loading) return <Loading />;
  if (!rankList || !rankList.length) return null;
  return (
    <div className="ranking-card card">
      {
        rankList.map((course, i) => (
          <Link
            key={`${headerTitle}-${course.courseId}`}
            to={`/review/${course.courseId}`}
          >
            <ListItem
              left={
                <span className="ranking-label center-flex-box">{i + 1}</span>
              }
              right={
                (course[sortKey])
                  ? <GradeIndicator grade={course[sortKey]} />
                  : (
                    <Badge
                      index={0}
                      text={`${course.numReviews} reviews`}
                    />
                  )
              }
            >
              <div className="search-list-item column">
                <span className="title">{course.courseId}</span>
                <span className="caption">{course.course.title}</span>
              </div>
            </ListItem>
          </Link>
        ))
      }
    </div>
  );
};

const HomePanel = () => {
  const [mode, setMode] = useState('Top Rated');
  const [sortKey, setSortKey] = useState('overall');
  const [anchorEl, setAnchorEl] = useState();
  const { data: reviews, loading: recentReviewsLoading } = useQuery(RECENT_REVIEWS_QUERY, {
    skip: mode !== 'Recent',
  });
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(POPULAR_COURSES_QUERY, {
    skip: mode !== 'Popular',
  });
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(TOP_RATED_COURSES_QUERY, {
    variables: {
      criteria: sortKey,
    },
    skip: mode !== 'Top Rated',
  });
  return (
    <div className="panel review-home-panel center-row">
      <BottomBorderRow
        items={MENU_ITEMS}
        select={mode}
        setSelect={setMode}
      />
      {
        mode === 'Top Rated' && (
          <>
            <ChipsRow
              items={['overall', ...RATING_FIELDS]}
              select={sortKey}
              setSelect={setSortKey}
            />
          </>
        )
      }
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
