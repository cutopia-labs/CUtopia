import { useState, useEffect, useContext, useRef, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Edit, Share, ExpandMore } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { Button, Divider, IconButton, Menu, MenuItem } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { TiArrowSortedUp } from 'react-icons/ti';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { FaUserAlt } from 'react-icons/fa';
import pluralize from 'pluralize';
import { useTitle } from 'react-use';

import './CoursePanel.scss';
import copy from 'copy-to-clipboard';
import { FiEdit } from 'react-icons/fi';
import clsx from 'clsx';

import { validCourse } from '../../helpers/marcos';
import {
  COURSE_INFO_QUERY,
  GET_REVIEW,
  REVIEWS_QUERY,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import { ViewContext, UserContext } from '../../store';
import useDebounce from '../../helpers/useDebounce';
import { LAZY_LOAD_BUFFER } from '../../constants/configs';
import { CourseInfo, ReviewsFilter, ReviewsResult } from '../../types';
import Footer from '../molecules/Footer';
import useMobileQuery from '../../helpers/useMobileQuery';
import ReviewCard from './ReviewCard';
import CourseCard from './CourseCard';

export enum COURSE_PANEL_MODES {
  INITIAL,
  GET_TARGET_REVIEW,
  FETCH_REVIEWS,
}

const SORTING_FIELDS = { date: 'ascendingDate', upvotes: 'ascendingVote' };

type ReviewFilterBarProps = {
  forwardedRef?: any;
  courseInfo: CourseInfo;
  reviewsPayload: Partial<ReviewsFilter>;
  dispatchReviewsPayload;
  fetchAllAction?: any;
  writeAction?: any;
  exceedLimit?: any;
  className?: any;
  isMobile?: any;
};

enum ReviewFilterBarMode {
  INITIAL,
  SORTING,
  LECTURER,
  TERM,
}

const ReviewFilterBar = ({
  forwardedRef,
  courseInfo,
  reviewsPayload,
  dispatchReviewsPayload,
  fetchAllAction,
  writeAction,
  exceedLimit,
  className,
  isMobile,
}: ReviewFilterBarProps) => {
  const [mode, setMode] = useState(ReviewFilterBarMode.INITIAL);
  const [anchorEl, setAnchorEl] = useState(null);

  const getLabel = (
    mode: ReviewFilterBarMode,
    reviewsPayload: Partial<ReviewsFilter>
  ) => {
    if (isMobile) {
      return '';
    }
    if (mode === ReviewFilterBarMode.SORTING) {
      console.log(reviewsPayload);
      return reviewsPayload.ascendingDate === null ? 'vote' : 'date';
    }
    return reviewsPayload[REVIEWS_CONFIGS[mode].key] || 'All';
  };

  const onSelect = (field: string, selected: boolean) => {
    console.log(`Setted to ${field}`);
    if (mode === ReviewFilterBarMode.SORTING) {
      field = selected ? (field === 'date' ? 'upvotes' : 'date') : field;
      dispatchReviewsPayload({
        ascendingDate: field === 'date' ? false : null,
        ascendingVote: field === 'upvotes' ? false : null,
      });
    } else {
      dispatchReviewsPayload({
        [REVIEWS_CONFIGS[mode].key]: selected ? '' : field,
      });
    }
    setAnchorEl(null);
  };

  const REVIEWS_CONFIGS = {
    [ReviewFilterBarMode.SORTING]: {
      key: 'sorting',
      selections: Object.keys(SORTING_FIELDS),
      icon: <TiArrowSortedUp />,
    },
    [ReviewFilterBarMode.LECTURER]: {
      key: 'lecturer',
      selections: courseInfo?.reviewLecturers || [],
      icon: <FaUserAlt size={12} />,
    },
    [ReviewFilterBarMode.TERM]: {
      key: 'term',
      selections: courseInfo?.reviewTerms || [],
      icon: <AiTwotoneCalendar />,
    },
  };

  return (
    <div
      ref={forwardedRef}
      className={clsx('panel card reviews-filter row', className)}
    >
      {courseInfo?.rating ? (
        <>
          <div className="filter-row center-row grid-auto-column">
            {!fetchAllAction &&
              Object.entries(REVIEWS_CONFIGS).map(([k, v]) => (
                <Button
                  key={v.key}
                  className={clsx(
                    'capsule-btn reviews-sort',
                    (reviewsPayload[v.key] ||
                      parseInt(k, 10) === ReviewFilterBarMode.SORTING) &&
                      'selected'
                  )}
                  size="small"
                  onClick={(e) => [
                    setMode(parseInt(k, 10)),
                    setAnchorEl(e.currentTarget),
                  ]}
                  startIcon={v.icon}
                  endIcon={<ExpandMore />}
                >
                  {getLabel(parseInt(k, 10), reviewsPayload)}
                </Button>
              ))}
            <div className="reviews-filter-label caption">
              {/* exceedLimit && `Limit exceeded (post 1 reviews to unlock)` */}
              {fetchAllAction && (
                <Button size="small" color="primary" onClick={fetchAllAction}>
                  Fetch All
                </Button>
              )}
            </div>
          </div>
          <Menu
            className="reviews-filter-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            TransitionProps={{
              onExited: () => setMode(ReviewFilterBarMode.INITIAL),
            }}
            disableScrollLock={true}
          >
            {(REVIEWS_CONFIGS[mode]?.selections || []).map((field: string) => {
              console.log(`sorting ${SORTING_FIELDS[field]}`);
              const selected =
                mode === ReviewFilterBarMode.SORTING
                  ? reviewsPayload[SORTING_FIELDS[field]] !== null
                  : reviewsPayload[REVIEWS_CONFIGS[mode].key] === field;
              return (
                <MenuItem
                  key={field}
                  onClick={() => onSelect(field, selected)}
                  selected={selected}
                >
                  {field}
                </MenuItem>
              );
            })}
          </Menu>
        </>
      ) : (
        <span>No review yet</span>
      )}
      <span className="right grid-auto-column">
        <IconButton className="edit" size="small" onClick={writeAction}>
          <FiEdit />
        </IconButton>
      </span>
    </div>
  );
};

const CoursePanel = () => {
  const { id: courseId, reviewId } = useParams<{
    id?: string;
    reviewId?: string;
  }>();
  useTitle(courseId);
  const [mode, setMode] = useState(COURSE_PANEL_MODES.INITIAL);
  const history = useHistory();
  const [FABOpen, setFABOpen] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
  const [reviews, setReviews] = useState([]);
  const view = useContext(ViewContext);
  const user = useContext(UserContext);
  const isMobile = useMobileQuery();
  const [FABHidden, setFABHidden] = useState(!isMobile);
  const reviewFilterBarRef = useRef<HTMLDivElement | null>(null);
  const [reviewsPayload, dispatchReviewsPayload] = useReducer(
    (state: Partial<ReviewsFilter>, action: Partial<ReviewsFilter>) =>
      ({
        ...state,
        ...action,
      } as Partial<ReviewsFilter>),
    {
      ascendingDate: false,
      ascendingVote: null,
    } as Partial<ReviewsFilter>
  );

  const FAB_GROUP_ACTIONS = Object.freeze([
    {
      icon: <Share />,
      name: 'Share',
      action: () => {
        copy(window.location.href);
        view.setSnackBar('Copied share link to clipboard!');
      },
    },
  ]);

  useEffect(() => {
    // Reset to reload the reviews once sortkey / filter changed
    if (reviews?.length) {
      setReviews([]);
      setLastEvaluatedKey(undefined);
    }
  }, [reviewsPayload]);

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
    onError: view.handleError,
  });

  // Fetch all reviews
  const { loading: reviewsLoading, refetch: reviewsRefetch } = useQuery<
    ReviewsResult,
    ReviewsFilter
  >(REVIEWS_QUERY, {
    skip: Boolean(reviewId),
    variables: {
      courseId,
      ...reviewsPayload,
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
    onError: view.handleError,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  // Fetch a review based on reviewId
  const { loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdDate: reviewId,
    },
    skip: !reviewId,
    onCompleted: (data) => {
      setReviews([data.review]);
    },
    onError: view.handleError,
  });

  const listenToScroll = useDebounce(async () => {
    console.log(`Scroll dep ${reviewId}`);
    const distanceFromBottom =
      document.documentElement.scrollHeight -
      document.documentElement.scrollTop -
      window.innerHeight;
    console.log(distanceFromBottom);
    // Set Function Bar for Desktop
    if (!isMobile) {
      const reviewFilterBarTop =
        reviewFilterBarRef?.current?.getBoundingClientRect()?.top;

      console.log(
        `Scroll height ${document.documentElement.scrollHeight} ${document.documentElement.scrollTop} ${reviewFilterBarTop}`
      );

      const desktopFABHidden = !(reviewFilterBarTop < 0);
      setFABHidden(desktopFABHidden);
    }
    // Load and setFAB
    if (distanceFromBottom <= LAZY_LOAD_BUFFER) {
      // Fetch more here;
      if (lastEvaluatedKey && courseId && !reviewId) {
        console.log('Refetching');
        await reviewsRefetch({
          courseId,
          ...reviewsPayload,
          lastEvaluatedKey: {
            courseId: lastEvaluatedKey.courseId,
            createdDate: lastEvaluatedKey.createdDate,
            upvotes: lastEvaluatedKey.upvotes,
          },
        });
        isMobile && setFABHidden(false);
      } else {
        setFABHidden(true);
      }
    } else {
      isMobile && setFABHidden(false);
    }
  }, 300);

  useEffect(() => {
    window.addEventListener('scroll', listenToScroll);
    return () => window.removeEventListener('scroll', listenToScroll);
  }, [listenToScroll, reviewId]);

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
    setMode(
      reviewId
        ? COURSE_PANEL_MODES.GET_TARGET_REVIEW
        : COURSE_PANEL_MODES.FETCH_REVIEWS
    );
  }, [reviewId]);

  return (
    <>
      <div className="course-panel-container grid-auto-row">
        <div className="course-panel panel card">
          <CourseCard
            courseInfo={{
              ...courseInfo?.subjects[0]?.courses[0],
              courseId,
            }}
            loading={courseInfoLoading}
          />
        </div>
        {!courseInfoLoading && (
          <>
            <ReviewFilterBar
              forwardedRef={reviewFilterBarRef}
              courseInfo={courseInfo?.subjects[0]?.courses[0]}
              reviewsPayload={reviewsPayload}
              dispatchReviewsPayload={dispatchReviewsPayload}
              fetchAllAction={
                Boolean(reviewId) && (() => history.push(`/review/${courseId}`))
              }
              writeAction={() => history.push(`/review/${courseId}/compose`)}
              exceedLimit={!user.data.fullAccess}
              isMobile={isMobile}
            />
            <SpeedDial
              ariaLabel="SpeedDial"
              hidden={!isMobile || FABHidden}
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
            {!isMobile && !FABHidden && (
              <ReviewFilterBar
                className="float"
                isMobile={true}
                courseInfo={courseInfo?.subjects[0]?.courses[0]}
                reviewsPayload={reviewsPayload}
                dispatchReviewsPayload={dispatchReviewsPayload}
                fetchAllAction={
                  Boolean(reviewId) &&
                  (() => history.push(`/review/${courseId}`))
                }
                writeAction={() => history.push(`/review/${courseId}/compose`)}
                exceedLimit={false}
              />
            )}
          </>
        )}
        {Boolean(courseInfo?.subjects[0]?.courses[0]) && (
          <span className="review-count caption center-row">
            {reviewId ? (
              <>
                {`Showing 1 review`}
                <span className="caption">{`(${courseInfo?.subjects[0]?.courses[0]?.rating?.numReviews} total)`}</span>
              </>
            ) : (
              `${pluralize(
                'review',
                courseInfo?.subjects[0]?.courses[0]?.rating?.numReviews || 0,
                true
              )}`
            )}
            <Divider />
          </span>
        )}
        <div className="grid-auto-row reviews-container">
          {(reviews || []).map((item) => (
            <ReviewCard
              key={item.createdDate}
              review={item}
              shareAction={() => {
                copy(
                  reviewId
                    ? window.location.href
                    : `${window.location.href}/${item.createdDate}`
                );
                view.setSnackBar('Copied sharelink to clipboard!');
              }}
              showAll={Boolean(reviewId)}
            />
          ))}
          {(reviewLoading || reviewsLoading) && <Loading />}
        </div>
        {lastEvaluatedKey === null && <Footer />}
      </div>
    </>
  );
};

export default observer(CoursePanel);
