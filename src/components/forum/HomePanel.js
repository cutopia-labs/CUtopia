import React, { useState, useEffect, useContext } from 'react';
import {
  Link, useHistory, useLocation, useParams,
} from 'react-router-dom';
import {
  BarChart, Sort, Edit, Share, ThumbUp, Whatshot,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';

import './HomePanel.css';
import GradeIndicator from '../GradeIndicator';
import CourseCard from './CourseCard';
import { validCourse } from '../../helpers/marcos';
import { RATING_FIELDS } from '../../constants/states';
import { RECENT_REVIEWS_QUERY, TOP_RATED_COURSES_QUERY, POPULAR_COURSES_QUERY } from '../../constants/queries';
import Loading from '../Loading';
import ReviewCard from './ReviewCard';
import { NotificationContext } from '../../store';
import copyToClipboard from '../../helpers/copyToClipboard';
import MyListItem from '../ListItem';
import Badge from '../Badge';

const RANKING_ITEMS = {
  'Top Rated': {
    icon: <ThumbUp />,
  },
  Popular: {
    icon: <Whatshot />,
  },
};

const RankingCard = ({
  rankList, children, headerTitle,
}) => (
  <div className="ranking-card card">
    <div className="ranking-card-header center-row">
      {RANKING_ITEMS[headerTitle].icon}
      <span className="ranking-card-header-title">{headerTitle}</span>
      {children}
    </div>
    {
      rankList.map((course, i) => (
        <Link
          key={`${headerTitle}-${course.courseId}`}
          to={`/review/${course.courseId}`}
        >
          <MyListItem
            left={
              <span className="ranking-label">{i + 1}</span>
            }
            right={
              course.overall
                ? <GradeIndicator grade={course.overall} />
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
          </MyListItem>
        </Link>
      ))
    }
  </div>
);

const HomePanel = () => {
  const { data: reviews, loading: recentReviewsLoading } = useQuery(RECENT_REVIEWS_QUERY);
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(POPULAR_COURSES_QUERY);
  const [sortKey, setSortKey] = useState('overall');
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(TOP_RATED_COURSES_QUERY, {
    variables: {
      criteria: sortKey,
    },
  });
  if (recentReviewsLoading || popularCoursesLoading || topRatedCoursesLoading) return <Loading />;
  return (
    <div className="review-home-panel">
      <div className="review-home-row center-row">
        {
          topRatedCourses && topRatedCourses.ranking.topRatedCourses
          && (
            <RankingCard
              rankList={topRatedCourses.ranking.topRatedCourses}
              headerTitle="Top Rated"
            />
          )
        }
        {
          popularCourses && popularCourses.ranking.popularCourses
          && (
            <RankingCard
              rankList={popularCourses.ranking.popularCourses}
              headerTitle="Popular"
            />
          )
        }
      </div>
    </div>
  );
};

export default HomePanel;
