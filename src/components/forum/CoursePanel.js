import React, { useState, useEffect, useContext } from 'react';
import {
  useHistory, useParams, useRouteMatch,
} from 'react-router-dom';
import {
  Sort, Edit, Share,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import {
  Button, IconButton, Menu, MenuItem,
} from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';

import './CoursePanel.css';
import { observer } from 'mobx-react-lite';
import CourseCard from './CourseCard';
import { validCourse } from '../../helpers/marcos';
import { COURSE_INFO_QUERY, GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import Loading from '../Loading';
import ReviewCard from './ReviewCard';
import { NotificationContext } from '../../store';
import copyToClipboard from '../../helpers/copyToClipboard';
import HomePanel from './HomePanel';
import ReviewEdit from './ReviewEdit';

export const COURSE_PANEL_MODES = Object.freeze({
  DEFAULT: 1, // i.e. card to show recent reviews & rankings
  WITH_REVIEW: 2,
  GET_TARGET_REVIEW: 3,
  FETCH_REVIEWS: 4,
  EDIT_REVIEW: 5,
});

const SORTING_FIELDS = Object.freeze([
  'date',
  'upvotes',
]);

const CourseSummary = ({
  courseInfo, sorting, setSorting, fetchAllAction, writeAction
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
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
                <div className="course-summary-label">{fetchAllAction ? 'Showing 1 review only!' : `${courseInfo.rating.numReviews} reviews`}</div>
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
      {
        !courseInfo.rating &&
        (
          <Button
            size="small"
            color="primary"
            onClick={writeAction}
          >
            Write One!
          </Button>
        )
      }
      {
        courseInfo.rating && fetchAllAction
        && (
          <Button
            size="small"
            color="primary"
            onClick={fetchAllAction}
          >
            Fetch All
          </Button>
        )
      }
    </div>
  );
};

const CoursePanel = () => {
  const { id: courseId, reviewId } = useParams();
  const [mode, setMode] = useState(courseId ? COURSE_PANEL_MODES.FETCH_REVIEWS : COURSE_PANEL_MODES.DEFAULT);
  const [sorting, setSorting] = useState('date');
  const history = useHistory();
  const [FABOpen, setFABOpen] = useState(false);
  const [FABHidden, setFABHidden] = useState(false);
  const notification = useContext(NotificationContext);
  const isEdit = useRouteMatch({
    path: '/review/:id/compose',
    strict: true,
    exact: true,
  });

  const FAB_GROUP_ACTIONS = Object.freeze([
    {
      icon: <Share />,
      name: 'Share',
      action: () => {
        copyToClipboard(window.location.href);
        notification.setSnackBar('Copied share link to clipboard!');
      },
    },
  ]);

  // Fetch course info
  const { data: courseInfo, courseInfoLoading, error } = useQuery(COURSE_INFO_QUERY, {
    skip: !courseId,
    ...(
      courseId
        && {
          variables: {
            subject: courseId.substring(0, 4),
            code: courseId.substring(4),
          },
        }
    ),
  });

  // Fetch all reviews
  const { data: reviews, loading: reviewsLoading, refetch } = useQuery(REVIEWS_QUERY, {
    variables: {
      courseId,
      ascendingDate: sorting === 'date' ? false : null,
      ascendingVote: sorting === 'upvotes' ? false : null,
    },
  });

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdDate: reviewId,
    },
    skip: !reviewId,
  });

  useEffect(() => {
    console.log(`Current id: ${courseId}`);
    if (validCourse(courseId)) {
      setMode(COURSE_PANEL_MODES.FETCH_REVIEWS);
    }
    else if (mode !== COURSE_PANEL_MODES.DEFAULT) setMode(COURSE_PANEL_MODES.DEFAULT);
  }, [courseId]);

  useEffect(() => {
    console.log(isEdit);
  }, [isEdit]);

  useEffect(() => {
    console.log(`Current mode: ${mode}`);
  }, [mode]);

  useEffect(() => {
    console.log(reviews);
  }, [reviews]);

  useEffect(() => {
    console.log('Review');
    console.log(review);
  }, [review]);

  if (mode === COURSE_PANEL_MODES.DEFAULT) {
    return (
      <HomePanel />
    );
  }

  if (isEdit) {
    return (
      <div className="review-edit-panel course-panel panel card">
        {
          !courseInfoLoading && courseInfo && courseInfo.subjects && courseInfo.subjects[0]
          && (
            <CourseCard
              courseInfo={{
                ...courseInfo.subjects[0].courses[0],
                courseId,
              }}
            />
          )
        }
        <ReviewEdit courseId={courseId} />
      </div>
    );
  }

  return (
    <div className="course-panel panel card">
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
              <CourseSummary
                courseInfo={courseInfo.subjects[0].courses[0]}
                sorting={sorting}
                setSorting={setSorting}
                fetchAllAction={Boolean(reviewId) && (() => history.push(`/review/${courseId}`))}
                writeAction={() => history.push(`/review/${courseId}/compose`)}
              />
              {
                reviewsLoading || reviewLoading
                  ? <Loading />
                  : (reviewId ? (review ? [review.review] : []) : reviews.reviews).map(item => (
                    <ReviewCard
                      key={item.createdDate}
                      review={item}
                      shareAction={() => {
                        copyToClipboard(reviewId ? window.location.href : `${window.location.href}/${item.createdDate}`);
                        notification.setSnackBar('Copied sharelink to clipboard!');
                      }}
                    />
                  ))
              }
              <SpeedDial
                ariaLabel="SpeedDial"
                hidden={FABHidden}
                icon={(
                  <SpeedDialIcon
                    onClick={() => {
                      if (!isEdit) {
                        history.push(`/review/${courseId}/compose`);
                      }
                    }}
                    openIcon={<Edit />}
                  />
                )}
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
            </>
          )
          : <Loading />
      }
    </div>
  );
};

export default observer(CoursePanel);
