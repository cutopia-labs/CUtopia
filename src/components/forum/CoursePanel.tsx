import { useState, useEffect, useContext, useRef, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Edit, Share } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { Divider } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import pluralize from 'pluralize';
import { useTitle } from 'react-use';

import './CoursePanel.scss';
import copy from 'copy-to-clipboard';

import { validCourse } from '../../helpers';
import {
  COURSE_INFO_QUERY,
  GET_REVIEW,
  REVIEWS_QUERY,
} from '../../constants/queries';
import Loading from '../atoms/Loading';
import { ViewContext, UserContext } from '../../store';
import useDebounce from '../../hooks/useDebounce';
import { LAZY_LOAD_BUFFER } from '../../constants/configs';
import { ReviewsFilter, ReviewsResult } from '../../types';
import Footer from '../molecules/Footer';
import useMobileQuery from '../../hooks/useMobileQuery';
import { getSimilarCourses } from '../../helpers/getCourses';
import FeedCard from '../molecules/FeedCard';
import DiscussionCard from '../discussion/DiscussionCard';
import ReviewCard from './ReviewCard';
import CourseCard from './CourseCard';
import ReviewFilterBar from './ReviewFilterBar';

export enum COURSE_PANEL_MODES {
  INITIAL,
  GET_TARGET_REVIEW,
  FETCH_REVIEWS,
}

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
  const [similarCourses, setSimilarCourse] = useState([]);
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

  // Fetch course info
  const {
    data: courseInfo,
    loading: courseInfoLoading,
    error,
  } = useQuery(COURSE_INFO_QUERY, {
    skip: !courseId,
    ...(courseId && {
      variables: {
        courseId,
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
      if (lastEvaluatedKey) {
        setReviews((prevReviews) =>
          prevReviews
            .concat(data.reviews.reviews)
            .filter(
              (v, i, a) => a.findIndex((m) => v.createdAt === m.createdAt) === i
            )
        );
      } else {
        setReviews(data.reviews.reviews);
      }
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
      createdAt: reviewId,
    },
    skip: !reviewId,
    onCompleted: (data) => {
      if (data.review) {
        setReviews([data.review]);
      }
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
            createdAt: lastEvaluatedKey.createdAt,
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
    if (reviews?.length) {
      setLastEvaluatedKey(undefined);
      reviewsRefetch({
        courseId,
        ...reviewsPayload,
      });
    }
  }, [reviewsPayload]);

  useEffect(() => {
    window.addEventListener('scroll', listenToScroll);
    return () => window.removeEventListener('scroll', listenToScroll);
  }, [listenToScroll, reviewId]);

  const fetchSimilarCourses = async (courseId) => {
    setSimilarCourse(await getSimilarCourses(courseId));
  };

  useEffect(() => {
    console.log(`Current id: ${courseId}`);
    if (reviews?.length) {
      setReviews([]);
    }
    if (validCourse(courseId)) {
      fetchSimilarCourses(courseId);
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
              ...courseInfo?.courses[0],
              courseId,
            }}
            loading={courseInfoLoading}
          />
        </div>
        {!courseInfoLoading && (
          <>
            <ReviewFilterBar
              forwardedRef={reviewFilterBarRef}
              courseInfo={courseInfo?.courses[0]}
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
                courseInfo={courseInfo?.courses[0]}
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
        {Boolean(courseInfo?.courses[0]) && (
          <span className="review-count caption center-row">
            {reviewId ? (
              <>
                {`Showing 1 review`}
                <span className="caption">{`(${courseInfo?.courses[0]?.rating?.numReviews} total)`}</span>
              </>
            ) : (
              `${pluralize(
                'review',
                courseInfo?.courses[0]?.rating?.numReviews || 0,
                true
              )}`
            )}
            <Divider />
          </span>
        )}
        <div className="grid-auto-row reviews-container">
          {(reviews || []).map((item) => (
            <ReviewCard
              key={item.createdAt}
              review={item}
              shareAction={() => {
                copy(
                  reviewId
                    ? window.location.href
                    : `${window.location.href}/${item.createdAt}`
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
      <div className="secondary-column sticky">
        <DiscussionCard courseId={courseId} />
        {!isMobile && (
          <FeedCard
            title="Suggestions"
            courses={similarCourses}
            onItemClick={(course) => history.push(`/review/${course.courseId}`)}
          />
        )}
      </div>
    </>
  );
};

export default observer(CoursePanel);
