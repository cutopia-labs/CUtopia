import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FaRegCalendar } from 'react-icons/fa';
import { BiMessageRounded } from 'react-icons/bi';
import { RiShareForwardLine } from 'react-icons/ri';
import { useMutation } from '@apollo/client';
import { IconButton, useMediaQuery } from '@material-ui/core';

import './ReviewCard.scss';
import clsx from 'clsx';
import { RATING_FIELDS, VOTE_ACTIONS } from '../../constants/states';
import { VOTE_REVIEW } from '../../constants/mutations';
import { getMMMDDYY } from '../../helpers/getTime';
import ShowMoreOverlay from '../molecules/ShowMoreOverlay';
import { Review } from '../../types';
import GradeRow from './GradeRow';
import LikeButtonsRow from './LikeButtonRow';

type ReviewCardProps = {
  review: Review;
  concise?: boolean;
  showAll?: boolean;
  shareAction?: () => void;
};

const ReviewCard = ({
  review,
  concise,
  showAll,
  shareAction,
}: ReviewCardProps) => {
  const [selectedCriteria, setSelectedCriteria] = useState('overall');
  const [voteReview, { loading, error }] = useMutation(VOTE_REVIEW);
  const [liked, setLiked] = useState(review.myVote); // null for unset, false for dislike, true for like
  const isMobile = useMediaQuery('(max-width:1260px)');
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(showAll);

  const updateVote = async (vote) => {
    console.log(review.courseId);
    if (
      Object.values(VOTE_ACTIONS).some(
        (v) => v === review.myVote || v === liked
      )
    ) {
      // i.e. already voted
      console.log('Voted Already');
      return;
    }
    const res = await voteReview({
      variables: {
        courseId: review.courseId,
        createdDate: review.createdDate,
        vote,
      },
    });
    console.log(res);
    if (res && !res.data.voteReview.error) {
      setLiked(vote);
    } else {
      alert(res.data.voteReview.error);
    }
  };

  useEffect(() => {
    console.log(review);
  }, []);

  if (concise) {
    return <div />;
  }
  return (
    <div className={clsx('review-card card', !showMore && 'retracted')}>
      <div className="course-summary review">
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
            <FaRegCalendar />
            <span className="course-summary-label term">{review.term}</span>
            <span className="course-summary-label separator">/</span>
            <span className="course-summary-label lecturer">
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
          ref={(ref) => {
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
          {RATING_FIELDS.map((field) => (
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
          {getMMMDDYY(review.createdDate)}
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
            onClick={shareAction}
            color="primary"
          >
            <RiShareForwardLine />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default observer(ReviewCard);
