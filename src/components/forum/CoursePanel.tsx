import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { Sort, Edit, Share } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';

import './CoursePanel.scss';
import copy from 'copy-to-clipboard';
import { validCourse } from '../../helpers/marcos';
import {
  COURSE_INFO_QUERY,
  GET_REVIEW,
  REVIEWS_QUERY,
  GET_USER,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import { NotificationContext, UserContext } from '../../store';
import { FULL_MEMBER_REVIEWS } from '../../constants/states';
import useDebounce from '../../helpers/useDebounce';
import { LAZY_LOAD_BUFFER } from '../../constants/configs';
import { ReviewsFilter, ReviewsResult } from '../../types';
import ReviewEdit from './ReviewEdit';
import HomePanel from './HomePanel';
import ReviewCard from './ReviewCard';
import CourseCard from './CourseCard';

export const COURSE_PANEL_MODES = Object.freeze({
  DEFAULT: 1, // i.e. card to show recent reviews & rankings
  WITH_REVIEW: 2,
  GET_TARGET_REVIEW: 3,
  FETCH_REVIEWS: 4,
  EDIT_REVIEW: 5,
});

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
    <div className="course-summary">
      {courseInfo.rating ? (
        <>
          <div className="center-row">
            <IconButton
              aria-label="sort"
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Sort />
            </IconButton>
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
            onClose={handleClose}
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
  const [mode, setMode] = useState(
    courseId ? COURSE_PANEL_MODES.FETCH_REVIEWS : COURSE_PANEL_MODES.DEFAULT
  );
  const [sorting, setSorting] = useState('date');
  const history = useHistory();
  const [FABOpen, setFABOpen] = useState(false);
  const [FABHidden, setFABHidden] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [reviews, setReviews] = useState([]);
  const notification = useContext(NotificationContext);
  const user = useContext(UserContext);
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
        copy(window.location.href);
        notification.setSnackBar('Copied share link to clipboard!');
      },
    },
  ]);

  const { data: userData, loading: userDataLoading } = useQuery(GET_USER, {
    skip: Boolean((user.user.reviewIds?.length || 0) >= FULL_MEMBER_REVIEWS),
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveUser(data?.user);
    },
  });

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
    skip:
      !courseId ||
      userDataLoading ||
      (((userData?.user?.reviewIds || user.user.reviewIds)?.length || 0) <
        FULL_MEMBER_REVIEWS &&
        user.exceedLimit),
    variables: {
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
    setFABHidden(false);
    // To clear previous lastEvaluatedKey
    if (lastEvaluatedKey !== undefined) {
      console.log(`Cleared lastEvaluatedKey ${lastEvaluatedKey}, refetch now`);
      reviewsRefetch({
        courseId,
        ascendingDate: sorting === 'date' ? false : null,
        ascendingVote: sorting === 'upvotes' ? false : null,
        lastEvaluatedKey: null,
      });
    }
    if (reviews.length) {
      setReviews([]);
    }
    if (validCourse(courseId)) {
      setMode(COURSE_PANEL_MODES.FETCH_REVIEWS);
      user.increaseViewCount();
    } else if (mode !== COURSE_PANEL_MODES.DEFAULT)
      setMode(COURSE_PANEL_MODES.DEFAULT);
  }, [courseId]);

  useEffect(() => {
    console.log(`Reviews loading: ${reviewsLoading}`);
  }, [reviewsLoading]);

  if (mode === COURSE_PANEL_MODES.DEFAULT) {
    return <HomePanel />;
  }

  if (isEdit) {
    return (
      <div className="review-edit-panel course-panel panel card">
        {!courseInfoLoading &&
          courseInfo &&
          courseInfo.subjects &&
          courseInfo.subjects[0] && (
            <CourseCard
              courseInfo={{
                ...courseInfo.subjects[0].courses[0],
                courseId,
              }}
            />
          )}
        <ReviewEdit courseId={courseId} />
      </div>
    );
  }

  return (
    <div className="course-panel panel card">
      {courseInfo && courseInfo.subjects && courseInfo.subjects[0] ? (
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
            fetchAllAction={
              Boolean(reviewId) && (() => history.push(`/review/${courseId}`))
            }
            writeAction={() => history.push(`/review/${courseId}/compose`)}
            exceedLimit={
              !userDataLoading &&
              ((userData?.user?.reviewIds || user.user.reviewIds)?.length ||
                0) < FULL_MEMBER_REVIEWS &&
              user.exceedLimit
            }
          />
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
          <SpeedDial
            ariaLabel="SpeedDial"
            hidden={FABHidden}
            icon={
              <SpeedDialIcon
                onClick={() => {
                  if (!isEdit) {
                    history.push(`/review/${courseId}/compose`);
                  }
                }}
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
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default observer(CoursePanel);
