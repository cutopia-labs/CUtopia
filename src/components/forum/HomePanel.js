import React, { useState } from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Sort, ThumbUp, Whatshot,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem } from '@material-ui/core';

import './HomePanel.css';
import GradeIndicator from '../GradeIndicator';
import { RATING_FIELDS } from '../../constants/states';
import { RECENT_REVIEWS_QUERY, TOP_RATED_COURSES_QUERY, POPULAR_COURSES_QUERY } from '../../constants/queries';
import Loading from '../Loading';
import ListItem from '../ListItem';
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
  rankList, children, headerTitle, sortKey,
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
          <ListItem
            left={
              <span className="ranking-label">{i + 1}</span>
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

const HomePanel = () => {
  const { data: reviews, loading: recentReviewsLoading } = useQuery(RECENT_REVIEWS_QUERY);
  const { data: popularCourses, loading: popularCoursesLoading } = useQuery(POPULAR_COURSES_QUERY);
  const [sortKey, setSortKey] = useState('overall');
  const [anchorEl, setAnchorEl] = useState();
  const { data: topRatedCourses, loading: topRatedCoursesLoading } = useQuery(TOP_RATED_COURSES_QUERY, {
    variables: {
      criteria: sortKey,
    },
  });
  if (recentReviewsLoading || popularCoursesLoading || topRatedCoursesLoading) return <Loading />;
  return (
    <div className="panel review-home-panel">
      <div className="review-home-row center-row">
        {
          topRatedCourses && topRatedCourses.ranking.topRatedCourses &&
          (
            <RankingCard
              rankList={topRatedCourses.ranking.topRatedCourses}
              headerTitle="Top Rated"
              sortKey={sortKey}
            >
              <div className="sort-selector center-row">
                <IconButton
                  aria-label="sort"
                  components="span"
                  size="small"
                  onClick={e => setAnchorEl(e.currentTarget)}
                >
                  <Sort />
                </IconButton>
                {sortKey}
              </div>
              <Menu
                id="simple-menu"
                className="sort-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl()}
              >
                {
                  ['overall', ...RATING_FIELDS].map(field => (
                    <MenuItem
                      key={field}
                      onClick={() => [setSortKey(field), setAnchorEl()]}
                      selected={sortKey === field}
                    >
                      {field}
                    </MenuItem>
                  ))
                }
              </Menu>
            </RankingCard>
          )
        }
        {
          popularCourses && popularCourses.ranking.popularCourses &&
          (
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
