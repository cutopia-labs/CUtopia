import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BiMessageRounded } from 'react-icons/bi';
import { RiShareForwardLine, RiFlag2Line } from 'react-icons/ri';
import { useMutation } from '@apollo/client';
import { IconButton } from '@material-ui/core';

import './ReviewCard.scss';
import clsx from 'clsx';
import { RATING_FIELDS, VOTE_ACTIONS } from '../../constants';
import { VOTE_REVIEW } from '../../constants/mutations';
import { getMMMDDYY } from '../../helpers/getTime';
import ShowMoreOverlay from '../molecules/ShowMoreOverlay';
import { Review } from '../../types';
import { ViewContext } from '../../store';
import useMobileQuery from '../../hooks/useMobileQuery';
import { getReviewId } from '../../helpers';
import GradeRow from './GradeRow';
import LikeButtonsRow from './LikeButtonRow';

type ReviewCardProps = {
  review: Review;
  concise?: boolean;
  showAll?: boolean;
  shareAction?: (item: Review) => void;
  reportAction?: (item: Review) => void;
};

const ReviewCard = ({
  review,
  concise,
  showAll,
  shareAction,
  reportAction,
}: ReviewCardProps) => {
  const [selectedCriteria, setSelectedCriteria] = useState('overall');
  const view = useContext(ViewContext);
  const [voteReview, { loading, error }] = useMutation(VOTE_REVIEW, {
    onError: view.handleError,
  });
  const [liked, setLiked] = useState(review.myVote); // null for unset, false for dislike, true for like
  const isMobile = useMobileQuery();
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(showAll);

  const updateVote = async vote => {
    console.log(review.courseId);
    if (
      Object.values(VOTE_ACTIONS).some(v => v === review.myVote || v === liked)
    ) {
      // i.e. already voted
      console.log('Voted Already');
      return;
    }
    const res = await voteReview({
      variables: {
        id: getReviewId(review),
        vote,
      },
    });
    console.log(res);
    setLiked(vote);
  };

  if (concise) {
    return <div />;
  }
  return (
    <div className={clsx('review-card card', !showMore && 'retracted')}>
      <div className="reviews-filter review">
        {Boolean(review.title) && (
          <div className="review-title center-row">
            <BiMessageRounded />
            {review.title}
          </div>
        )}
        <div
          className={clsx(
            'review-info-row',
            !Boolean(review.title) && 'no-title'
          )}
        >
          <div className="center-row">
            <AiTwotoneCalendar />
            <span className="reviews-filter-label term">{review.term}</span>
            <span className="reviews-filter-label separator">•</span>
            <span className="reviews-filter-label lecturer">
              {review.lecturer}
            </span>
          </div>
        </div>
        <GradeRow
          rating={review}
          isReview
          additionalClassName="grade-row tabs-row review-grade-row"
          additionalChildClassName="tab"
          selected={selectedCriteria}
          setSelected={setSelectedCriteria}
          isMobile={isMobile}
        />
      </div>
      {selectedCriteria === 'overall' ? (
        <div
          ref={ref => {
            // Wrap if course-card is too long
            if (
              !skipHeightCheck &&
              ref &&
              ref.clientHeight > window.innerHeight * 0.4
            ) {
              setShowMore(false);
            }
          }}
          className={`review-text-full${showMore ? '' : ' retracted'}`}
        >
          {RATING_FIELDS.map(field => (
            <div key={field} className="review-text-container">
              <p className="review-text-label review-text">{field}</p>
              <p className="review-text">{review[field].text}</p>
            </div>
          ))}
          <ShowMoreOverlay
            visible={!showMore}
            onShowMore={() => [setShowMore(true), setSkipHeightCheck(true)]}
          />
        </div>
      ) : (
        <div className="review-text-container">
          <p className="review-text-label review-text">{selectedCriteria}</p>
          <p className="review-text">{review[selectedCriteria].text}</p>
        </div>
      )}
      <div
        className={`review-bottom-row center-row${
          showMore ? '' : ' retracted'
        }`}
      >
        <span className="review-title-author">
          {`@`}
          <span>{review.anonymous ? 'Anonymous' : review.username}</span>
          {' • '}
          {getMMMDDYY(review.createdAt)}
        </span>
        <div className="review-bottom-btn-row right center-row">
          <LikeButtonsRow
            liked={liked}
            myVote={review.myVote}
            updateVote={updateVote}
            likeCaption={
              (review.upvotes || 0) +
              (review.myVote === null && liked === VOTE_ACTIONS.UPVOTE ? 1 : 0)
            }
            dislikeCaption={
              (review.downvotes || 0) +
              (review.myVote === null && liked === VOTE_ACTIONS.DOWNVOTE
                ? 1
                : 0)
            }
          />
          <IconButton
            className="share-icon-btn"
            size="small"
            onClick={() => reportAction(review)}
          >
            <RiFlag2Line />
          </IconButton>
          <IconButton
            className="share-icon-btn"
            size="small"
            onClick={() => shareAction(review)}
          >
            <RiShareForwardLine />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default observer(ReviewCard);
