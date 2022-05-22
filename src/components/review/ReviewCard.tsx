import { FC, useState } from 'react';
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
import { useView } from '../../store';
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

const ReviewCard: FC<ReviewCardProps> = ({
  review,
  concise,
  showAll,
  shareAction,
  reportAction,
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState('overall');
  const view = useView();
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
      <div className={clsx(styles.reviewHeader, 'row')}>
        {Boolean(review.title) && (
          <div className={clsx(styles.reviewTitle, 'center-row ellipsis-text')}>
            <BiMessageRounded />
            {review.title}
          </div>
        )}
        <div
          className={clsx(
            styles.reviewInfoRow,
            !Boolean(review.title) && styles.noTitle,
            'center-row'
          )}
        >
          <AiTwotoneCalendar />
          <span className={clsx('reviewsFilterLabel', styles.term)}>
            {review.term}
          </span>
          <span className={clsx('reviewsFilterLabel', styles.separator)}>
            •
          </span>
          <span className={clsx('reviewsFilterLabel', styles.lecturer)}>
            {review.lecturer}
          </span>
        </div>
        <GradeRow
          rating={review}
          isReview
          style={clsx(styles.reviewGradeRow, styles.gradeRow, 'tabs-row')}
          additionalChildClassName={clsx(styles.gradeIndicatorContainer, 'tab')}
          gradeIndicatorStyle={styles.gradeIndicator}
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
      <div className={clsx(styles.reviewBottomRow, 'center-row')}>
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
