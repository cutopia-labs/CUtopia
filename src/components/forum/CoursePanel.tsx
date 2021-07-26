import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Edit, Share, ExpandMore } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';

import './CoursePanel.scss';
import copy from 'copy-to-clipboard';
import { validCourse } from '../../helpers/marcos';
import {
  COURSE_INFO_QUERY,
  GET_REVIEW,
  REVIEWS_QUERY,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import { NotificationContext, UserContext } from '../../store';
import { FULL_MEMBER_REVIEWS } from '../../constants/states';
import useDebounce from '../../helpers/useDebounce';
import { LAZY_LOAD_BUFFER } from '../../constants/configs';
import { ReviewsFilter, ReviewsResult } from '../../types';
import Footer from '../molecules/Footer';
import ReviewCard from './ReviewCard';
import CourseCard from './CourseCard';

export enum COURSE_PANEL_MODES {
  WITH_REVIEW,
  GET_TARGET_REVIEW,
  FETCH_REVIEWS,
  EDIT_REVIEW,
}

const SORTING_FIELDS = Object.freeze(['date', 'upvotes']);

const CourseSummary = ({
  courseInfo,
  sorting,
  setSorting,
  fetchAllAction,
  writeAction,
  exceedLimit,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClose = (field) => {
    console.log(`Setted to ${field}`);
    setSorting(field);
    setAnchorEl(null);
  };
  return (
    <div className="panel card course-summary row">
      {courseInfo.rating ? (
        <>
          <div className="center-row">
            <Button
              className="reviews-sort"
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<ExpandMore />}
            >
              {sorting}
            </Button>
            <div className="course-summary-label">
              {exceedLimit &&
                `Limit exceeded (post ${FULL_MEMBER_REVIEWS} reviews to unlock)`}
              {!exceedLimit &&
                (fetchAllAction
                  ? 'Showing 1 review only!'
                  : `${courseInfo.rating.numReviews} reviews`)}
            </div>
          </div>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {SORTING_FIELDS.map((field) => (
              <MenuItem
                key={field}
                onClick={() => handleClose(field)}
                selected={sorting === field}
              >
                {field}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <span>No review yet</span>
      )}
      <Button size="small" color="primary" onClick={writeAction}>
        Write One!
      </Button>
      {courseInfo.rating && fetchAllAction && (
        <Button size="small" color="primary" onClick={fetchAllAction}>
          Fetch All
        </Button>
      )}
    </div>
  );
};

const CoursePanel = () => {
  const { id: courseId, reviewId } = useParams<{
    id?: string;
    reviewId?: string;
  }>();
  const [mode, setMode] = useState(COURSE_PANEL_MODES.FETCH_REVIEWS);
  const [sorting, setSorting] = useState('date');
  const history = useHistory();
  const [FABOpen, setFABOpen] = useState(false);
  const [FABHidden, setFABHidden] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
  const [reviews, setReviews] = useState([]);
  const notification = useContext(NotificationContext);
  const user = useContext(UserContext);

  const FAB_GROUP_ACTIONS = Object.freeze([
    {
      icon: <Share />,
      name: 'Share',
      action: () => {
        copy(window.location.href);
        notification.setSnackBar('Copied share link to clipboard!');
      },
    },
  ]);

  // Fetch course info
  const {
    data: courseInfo,
    loading: courseInfoLoading,
    error,
  } = useQuery(COURSE_INFO_QUERY, {
    skip: !courseId,
    ...(courseId && {
      variables: {
        subject: courseId.substring(0, 4),
        code: courseId.substring(4),
      },
    }),
    fetchPolicy: 'cache-first',
  });

  // Fetch all reviews
  const {
    data,
    loading: reviewsLoading,
    refetch: reviewsRefetch,
  } = useQuery<ReviewsResult, ReviewsFilter>(REVIEWS_QUERY, {
    skip: false,
    /* userDataLoading ||
      (((userData?.user?.reviewIds || user.user.reviewIds)?.length || 0) <
        FULL_MEMBER_REVIEWS &&
        user.exceedLimit)*/ variables: {
      courseId,
      ascendingDate: sorting === 'date' ? false : null,
      ascendingVote: sorting === 'upvotes' ? false : null,
    },
    onCompleted: (data) => {
      console.log(
        `Fetched ${courseId} with ${lastEvaluatedKey}, updated ${JSON.stringify(
          data.reviews.lastEvaluatedKey
        )}`
      );
      console.table(data);
      setReviews((prevReviews) =>
        prevReviews
          .concat(data.reviews.reviews)
          .filter(
            (v, i, a) =>
              a.findIndex((m) => v.createdDate === m.createdDate) === i
          )
      );
      setLastEvaluatedKey(data.reviews.lastEvaluatedKey);
    },
    onError: (e) => {
      alert(e);
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdDate: reviewId,
    },
    skip: !reviewId,
    onCompleted: (data) => {
      setReviews([data.review]);
    },
  });

  const listenToScroll = useDebounce(async () => {
    const distanceFromBottom =
      document.documentElement.scrollHeight -
      document.documentElement.scrollTop -
      window.innerHeight;
    console.log(distanceFromBottom);
    if (distanceFromBottom <= LAZY_LOAD_BUFFER) {
      // Fetch more here;
      if (lastEvaluatedKey && courseId && !reviewId) {
        console.log('Refetching');
        console.log({
          courseId,
          ascendingDate: sorting === 'date' ? false : null,
          ascendingVote: sorting === 'upvotes' ? false : null,
          lastEvaluatedKey,
        });
        await reviewsRefetch({
          courseId,
          ascendingDate: sorting === 'date' ? false : null,
          ascendingVote: sorting === 'upvotes' ? false : null,
          lastEvaluatedKey: {
            courseId: lastEvaluatedKey.courseId,
            createdDate: lastEvaluatedKey.createdDate,
            upvotes: lastEvaluatedKey.upvotes,
          },
        });
        setFABHidden(false);
      } else {
        setFABHidden(true);
      }
    } else {
      setFABHidden(false);
    }
  }, 300);

  useEffect(() => {
    window.addEventListener('scroll', listenToScroll);
    return () => window.removeEventListener('scroll', listenToScroll);
  }, [listenToScroll]);

  useEffect(() => {
    console.log(`Current id: ${courseId}`);
    if (reviews.length) {
      setReviews([]);
    }
    if (validCourse(courseId)) {
      setMode(COURSE_PANEL_MODES.FETCH_REVIEWS);
      user.increaseViewCount();
    } else {
      // Display ERROR PAGE
    }
  }, [courseId]);

  useEffect(() => {
    console.log(`Reviews loading: ${reviewsLoading}`);
  }, [reviewsLoading]);

  useEffect(() => {
    console.log(`Initiated with course ${courseId}`);
  }, []);

  return (
    <>
      {(reviewsLoading || courseInfoLoading) && <Loading fixed />}
      <div className="column">
        <div className="course-panel panel card">
          {!courseInfoLoading && (
            <CourseCard
              courseInfo={{
                ...courseInfo?.subjects[0]?.courses[0],
                courseId,
              }}
            />
          )}
        </div>
        {!courseInfoLoading && (
          <>
            <CourseSummary
              courseInfo={courseInfo.subjects[0].courses[0]}
              sorting={sorting}
              setSorting={setSorting}
              fetchAllAction={
                Boolean(reviewId) && (() => history.push(`/review/${courseId}`))
              }
              writeAction={() => history.push(`/review/${courseId}/compose`)}
              exceedLimit={
                false /*
                !userDataLoading &&
                ((userData?.user?.reviewIds || user.user.reviewIds)?.length ||
                  0) < FULL_MEMBER_REVIEWS &&
                user.exceedLimit
              */
              }
            />
            <SpeedDial
              ariaLabel="SpeedDial"
              hidden={FABHidden}
              icon={
                <SpeedDialIcon
                  onClick={() => history.push(`/review/${courseId}/compose`)}
                  openIcon={<Edit />}
                />
              }
              onClose={() => setFABOpen(false)}
              onOpen={() => setFABOpen(true)}
              open={FABOpen}
              className="course-panel-fab"
            >
              {FAB_GROUP_ACTIONS.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.action}
                />
              ))}
            </SpeedDial>
          </>
        )}
        {(reviewsLoading || reviewLoading) && <Loading fixed />}
        {(review ? [review.review] : reviews).map((item) => (
          <ReviewCard
            key={item.createdDate}
            review={item}
            shareAction={() => {
              copy(
                reviewId
                  ? window.location.href
                  : `${window.location.href}/${item.createdDate}`
              );
              notification.setSnackBar('Copied sharelink to clipboard!');
            }}
            showAll={Boolean(reviewId)}
          />
        ))}
        {lastEvaluatedKey === null && <Footer mt />}
      </div>
    </>
  );
};

export default observer(CoursePanel);
