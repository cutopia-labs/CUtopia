import React, { useState, useEffect } from 'react';
import {
  Link, useHistory, useLocation, useParams,
} from 'react-router-dom';
import { BarChart, Sort } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import SpeedDial from '@material-ui/lab/SpeedDial';

import './CoursePanel.css';
import GradeIndicator from '../GradeIndicator';
import CourseCard from './CourseCard';
import { validCourse } from '../../helpers/marcos';
import { RATING_FIELDS } from '../../constants/states';
import { COURSE_INFO_QUERY, GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import Loading from '../Loading';
import ReviewCard from './ReviewCard';

export const COURSE_PANEL_MODES = Object.freeze({
  DEFAULT: 0,
  WITH_REVIEW: 1,
  GET_TARGET_REVIEW: 2,
  FETCH_REVIEWS: 3,
});

const targetReview = '1231231';

const SORTING_FIELDS = Object.freeze([
  'date',
  'upvotes',
]);

const CourseSummary = ({ courseInfo, sorting, setSorting }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = field => {
    console.log(`Setted to ${field}`);
    setSorting(field);
    setAnchorEl(null);
  };
  return (
    <div className="course-summary">
      {
        courseInfo.rating
          ? (
            <>
              <div className="center-row">
                <IconButton
                  aria-label="sort"
                  components="span"
                  size="small"
                  onClick={e => setAnchorEl(e.currentTarget)}
                >
                  <Sort />
                </IconButton>
                <div className="course-summary-label">{`${courseInfo.rating.numReviews} reviews`}</div>
              </div>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {
                  SORTING_FIELDS.map(field => (
                    <MenuItem
                      key={field}
                      onClick={() => handleClose(field)}
                      selected={sorting === field}
                    >
                      {field}
                    </MenuItem>
                  ))
                }
              </Menu>
            </>
          )
          : <span>No review yet</span>
      }
    </div>
  );
};

export default function CoursePanel() {
  const { id } = useParams();
  const courseId = validCourse(id) ? id.toUpperCase() : '';
  const [mode, setMode] = useState(courseId ? COURSE_PANEL_MODES.FETCH_REVIEWS : COURSE_PANEL_MODES.DEFAULT);
  const [sorting, setSorting] = useState('date');
  const history = useHistory();

  // Fetch course info
  const { data: courseInfo, courseInfoLoading, error } = useQuery(COURSE_INFO_QUERY, {
    variables: {
      subject: courseId.substring(0, 4),
      code: courseId.substring(4),
    },
    skip: !courseId,
  });

  // Fetch all reviews
  const { data: reviews, loading: reviewsLoading, refetch } = useQuery(REVIEWS_QUERY, {
    variables: {
      courseId,
    },
    skip: mode !== COURSE_PANEL_MODES.FETCH_REVIEWS,
  });

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: targetReview,
    skip: mode !== COURSE_PANEL_MODES.GET_TARGET_REVIEW,
  });

  useEffect(() => {
    if (courseInfo) {
      if (!courseInfo.subjects || !courseInfo.subjects[0]) {
        history.push('/review');
      }
    }
  }, [courseInfo]);

  useEffect(() => {
    console.log(`courseId: ${courseId}`);
  }, [courseId]);

  useEffect(() => {
    console.log(reviews);
  }, [reviews]);

  if (!validCourse(courseId)) {
    return (
      <div className="course-panel card">
        Recent Reviews
      </div>
    );
  }

  return (
    <div className="course-panel card">
      {
        !courseInfoLoading && courseInfo && courseInfo.subjects && courseInfo.subjects[0]
          ? (
            <>
              <CourseCard
                courseInfo={{
                  ...courseInfo.subjects[0].courses[0],
                  courseId,
                }}
              />
              <CourseSummary courseInfo={courseInfo.subjects[0].courses[0]} sorting={sorting} setSorting={setSorting} />
              {
                reviewsLoading
                  ? <Loading />
                  : mode === COURSE_PANEL_MODES.FETCH_REVIEWS && reviews && Boolean(reviews.reviews.length)
                  && reviews.reviews.map(item => (
                    <ReviewCard key={item.createdDate} review={item} />
                  ))
              }
            </>
          )
          : <Loading />
      }
    </div>
  );
}
