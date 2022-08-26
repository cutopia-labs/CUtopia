import { useState, useEffect, useRef, useReducer, FC } from 'react';
import { useQuery } from '@apollo/client';
import { Divider } from '@mui/material';
import pluralize from 'pluralize';
import copy from 'copy-to-clipboard';
import { ReportCategory } from 'cutopia-types/lib/codes';
import { useRouter } from 'next/router';

import styles from '../../styles/components/review/CourseReviews.module.scss';
import { removeEmptyValues } from '../../helpers';
import { GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import Loading from '../atoms/Loading';
import { useView } from '../../store';
import useDebounce from '../../hooks/useDebounce';
import { LAZY_LOAD_BUFFER, REVIEWS_PER_PAGE } from '../../config';
import { CourseInfo, Review, ReviewsFilter, ReviewsResult } from '../../types';
import Footer from '../molecules/Footer';
import If from '../atoms/If';
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
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const view = useView();
  const reviewFilterBarRef = useRef<HTMLDivElement | null>(null);
  const [reviewsPayload, dispatchReviewsPayload] = useReducer(
    (state: Partial<ReviewsFilter>, action: Partial<ReviewsFilter>) =>
      removeEmptyValues({
        ...state,
        ...action,
      }),
    {
      sortBy: 'createdAt',
    } as Partial<ReviewsFilter>
  );

  // Fetch all reviews
  const { loading: reviewsLoading, refetch: reviewsRefetch } = useQuery<
    ReviewsResult,
    ReviewsFilter
  >(REVIEWS_QUERY, {
    skip: Boolean(reviewId) || courseInfoLoading || !courseInfo?.rating,
    variables: {
      courseId,
      ...reviewsPayload,
    },
    onCompleted: data => {
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
    fetchPolicy: 'cache-and-network',
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
    const distanceFromBottom =
      document.documentElement.scrollHeight -
      document.documentElement.scrollTop -
      window.innerHeight;

    // Set Function Bar for Desktop
    if (!isMobile) {
      const reviewFilterBarTop =
        reviewFilterBarRef?.current?.getBoundingClientRect()?.top;

      const desktopFABHidden = !(reviewFilterBarTop < 0);
      setFABHidden(desktopFABHidden);
    }
    // Load and setFAB
    if (distanceFromBottom <= LAZY_LOAD_BUFFER) {
      // Fetch more here;
      if (page && courseId && !reviewId) {
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

  const writeReview = () =>
    router.push(`/review/${courseId}?mode=edit`, undefined, { shallow: true });

  return (
    <>
      {!courseInfoLoading && (
        <ReviewFilterBar
          forwardedRef={reviewFilterBarRef}
          courseInfo={courseInfo}
          reviewsPayload={reviewsPayload}
          dispatchReviewsPayload={dispatchReviewsPayload}
          fetchAllAction={
            Boolean(reviewId) && (() => router.push(`/review/${courseId}`))
          }
          writeAction={writeReview}
          exceedLimit={false}
          isMobile={isMobile}
        />
      )}
      {!isMobile && !FABHidden && (
        <ReviewFilterBar
          className={styles.floatReviewFilter}
          isMobile={true}
          courseInfo={courseInfo}
          reviewsPayload={reviewsPayload}
          dispatchReviewsPayload={dispatchReviewsPayload}
          fetchAllAction={
            Boolean(reviewId) && (() => router.push(`/review/${courseId}`))
          }
          writeAction={writeReview}
          exceedLimit={false}
        />
      )}
      {Boolean(courseInfo) && (
        <span className="review-count caption center-row">
          <If
            visible={reviewId}
            elseNode={`${pluralize(
              'review',
              courseInfo?.rating?.numReviews || 0,
              true
            )}`}
          >
            {`Showing 1 review`}
            <span className="caption">{`(${
              courseInfo?.rating?.numReviews || ''
            } total)`}</span>
          </If>
          <Divider />
        </span>
      )}
      <div className="grid-auto-row">
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
      <Footer visible={page === null} />
    </>
  );
};

export default CourseReviews;
