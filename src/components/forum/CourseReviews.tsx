import { useState, useEffect, useContext, useRef, useReducer, FC } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Divider } from '@material-ui/core';
import pluralize from 'pluralize';

import './CourseReviews.scss';
import copy from 'copy-to-clipboard';

import { ReportCategory } from 'cutopia-types/lib/codes';
import { removeEmptyValues } from '../../helpers';
import { GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import Loading from '../atoms/Loading';
import { ViewContext, UserContext } from '../../store';
import useDebounce from '../../hooks/useDebounce';
import { LAZY_LOAD_BUFFER, REVIEWS_PER_PAGE } from '../../constants/configs';
import { CourseInfo, Review, ReviewsFilter, ReviewsResult } from '../../types';
import Footer from '../molecules/Footer';
import ReviewCard from './ReviewCard';
import ReviewFilterBar from './ReviewFilterBar';

const getNextPage = (currPage: number, numReviews: number) => {
  const numLoaded = currPage * REVIEWS_PER_PAGE;
  return numReviews > numLoaded ? currPage + 1 : null;
};

type Props = {
  courseId: string;
  reviewId: string;
  courseInfo: CourseInfo;
  courseInfoLoading: boolean;
  isMobile: boolean;
  FABHidden: boolean;
  setFABHidden: (b: boolean) => any;
};

const CourseReviews: FC<Props> = ({
  courseId,
  reviewId,
  courseInfo,
  courseInfoLoading,
  isMobile,
  FABHidden,
  setFABHidden,
}) => {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const view = useContext(ViewContext);
  const user = useContext(UserContext);
  const reviewFilterBarRef = useRef<HTMLDivElement | null>(null);
  const [reviewsPayload, dispatchReviewsPayload] = useReducer(
    (state: Partial<ReviewsFilter>, action: Partial<ReviewsFilter>) =>
      removeEmptyValues({
        ...state,
        ...action,
      }) as Partial<ReviewsFilter>,
    {
      sortBy: 'createdAt',
    } as Partial<ReviewsFilter>
  );

  // Fetch all reviews
  const { loading: reviewsLoading, refetch: reviewsRefetch } = useQuery<
    ReviewsResult,
    ReviewsFilter
  >(REVIEWS_QUERY, {
    skip: Boolean(reviewId || !courseInfo?.rating),
    variables: {
      courseId,
      ...reviewsPayload,
    },
    onCompleted: data => {
      console.table(data);
      if (page) {
        setReviews(prevReviews =>
          prevReviews
            .concat(data.reviews)
            .filter(
              (v, i, a) => a.findIndex(m => v.createdAt === m.createdAt) === i
            )
        );
      } else {
        setReviews(data.reviews);
      }
      setPage(getNextPage(page, courseInfo?.rating?.numReviews));
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
    onCompleted: data => {
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
      if (page && courseId && !reviewId) {
        console.log('Refetching');
        await reviewsRefetch({
          courseId,
          ...reviewsPayload,
          page,
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
      setPage(0);
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

  useEffect(() => {
    if (reviews?.length) {
      setReviews([]);
    }
  }, [courseId]);

  const reportReview = (item: Review) => {
    view.setDialog({
      key: 'reportIssues',
      contentProps: {
        reportCategory: ReportCategory.REVIEW,
        id: `${courseId}#${item.createdAt}`,
      },
    });
  };

  const shareReview = (item: Review) => {
    copy(
      reviewId
        ? window.location.href
        : `${window.location.href}/${item.createdAt}`
    );
    view.setSnackBar('Copied sharelink to clipboard!');
  };

  return (
    <>
      {!courseInfoLoading && (
        <ReviewFilterBar
          forwardedRef={reviewFilterBarRef}
          courseInfo={courseInfo}
          reviewsPayload={reviewsPayload}
          dispatchReviewsPayload={dispatchReviewsPayload}
          fetchAllAction={
            Boolean(reviewId) && (() => history.push(`/review/${courseId}`))
          }
          writeAction={() => history.push(`/review/${courseId}/compose`)}
          exceedLimit={!user.data.fullAccess}
          isMobile={isMobile}
        />
      )}
      {!isMobile && !FABHidden && (
        <ReviewFilterBar
          className="float"
          isMobile={true}
          courseInfo={courseInfo}
          reviewsPayload={reviewsPayload}
          dispatchReviewsPayload={dispatchReviewsPayload}
          fetchAllAction={
            Boolean(reviewId) && (() => history.push(`/review/${courseId}`))
          }
          writeAction={() => history.push(`/review/${courseId}/compose`)}
          exceedLimit={false}
        />
      )}
      {Boolean(courseInfo) && (
        <span className="review-count caption center-row">
          {reviewId ? (
            <>
              {`Showing 1 review`}
              <span className="caption">{`(${courseInfo?.rating?.numReviews} total)`}</span>
            </>
          ) : (
            `${pluralize('review', courseInfo?.rating?.numReviews || 0, true)}`
          )}
          <Divider />
        </span>
      )}
      <div className="grid-auto-row reviews-container">
        {(reviews || []).map(item => (
          <ReviewCard
            key={item.createdAt}
            review={item}
            reportAction={reportReview}
            shareAction={shareReview}
            showAll={Boolean(reviewId)}
          />
        ))}
        {(reviewLoading || reviewsLoading) && <Loading />}
      </div>
      {page === null && <Footer />}
    </>
  );
};

export default CourseReviews;
