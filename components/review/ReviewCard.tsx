import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BiMessageRounded } from 'react-icons/bi';
import { RiShareForwardLine, RiFlag2Line } from 'react-icons/ri';
import { useMutation } from '@apollo/client';
import { IconButton } from '@material-ui/core';

import clsx from 'clsx';
import styles from '../../styles/components/review/ReviewCard.module.scss';
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
    <div className={clsx(styles.reviewCard, 'card', !showMore && 'retracted')}>
      <div className="reviewsFilter review">
        {Boolean(review.title) && (
          <div className={clsx(styles.reviewTitle, 'center-row ellipsis-text')}>
            <BiMessageRounded />
            {review.title}
          </div>
        )}
        <div
          className={clsx(
            styles.reviewInfoRow,
            !Boolean(review.title) && 'no-title'
          )}
        >
          <div className="center-row">
            <AiTwotoneCalendar />
            <span className="reviewsFilterLabel term">{review.term}</span>
            <span className="reviewsFilterLabel separator">•</span>
            <span className="reviewsFilterLabel lecturer">
              {review.lecturer}
            </span>
          </div>
        </div>
        <GradeRow
          rating={review}
          isReview
          additionalClassName={clsx(styles.reviewGradeRow, 'gradeRow tabs-row')}
          additionalChildClassName="tab"
          selected={selectedCriteria}
          setSelected={setSelectedCriteria}
          isMobile={isMobile}
        />
      </div>
      {selectedCriteria === 'overall' ? (
        <div
          ref={ref => {
            // Wrap if courseCard is too long
            if (
              !skipHeightCheck &&
              ref &&
              ref.clientHeight > window.innerHeight * 0.4
            ) {
              setShowMore(false);
            }
          }}
          className={clsx(styles.reviewTextFull, !showMore && 'retracted')}
        >
          {RATING_FIELDS.map(field => (
            <div key={field}>
              <p className={clsx(styles.reviewTextLabel, styles.reviewText)}>
                {field}
              </p>
              <p className={styles.reviewText}>{review[field].text}</p>
            </div>
          ))}
          <ShowMoreOverlay
            style={styles.reviewShowMoreOverlay}
            visible={!showMore}
            onShowMore={() => [setShowMore(true), setSkipHeightCheck(true)]}
          />
        </div>
      ) : (
        <div>
          <p className={clsx(styles.reviewTextLabel, styles.reviewText)}>
            {selectedCriteria}
          </p>
          <p className={styles.reviewText}>{review[selectedCriteria].text}</p>
        </div>
      )}
      <div className={clsx(styles.reviewBottomRow, !showMore && 'retracted')}>
        <span className={styles.reviewTitleAuthor}>
          {`@`}
          <span>{review.anonymous ? 'Anonymous' : review.username}</span>
          {' • '}
          {getMMMDDYY(review.createdAt)}
        </span>
        <div className={clsx(styles.reviewBottomBtnRow, 'right center-row')}>
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
            className={styles.shareIconBtn}
            size="small"
            onClick={() => reportAction(review)}
          >
            <RiFlag2Line />
          </IconButton>
          <IconButton
            className={styles.shareIconBtn}
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