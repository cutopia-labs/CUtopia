import React, {
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  FaChalkboardTeacher, FaRegCalendarAlt,
} from 'react-icons/fa';
import { useMutation } from '@apollo/client';

import './ReviewCard.css';
import { VOTE_ACTIONS } from '../../constants/states';
import { VOTE_REVIEW } from '../../constants/mutations';
import { getDateDifference, getMMMDDYY } from '../../helpers/getTime';
import GradeIndicator from '../GradeIndicator';
import GradeRow from './GradeRow';
import LikeButtonsRow from './LikeButtonRow';

const ReviewCard = ({
  review, onClick, concise, showAll,
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState('grading');
  const [voteReview, { loading, error }] = useMutation(VOTE_REVIEW);
  const [liked, setLiked] = useState(review.myVote); // null for unset, false for dislike, true for like

  const updateVote = async vote => {
    console.log(review.courseId);
    if (Object.values(VOTE_ACTIONS).some(v => (v === review.myVote || v === liked))) { // i.e. already voted
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
    }
    else {
      alert(res.data.voteReview.error);
    }
  };

  if (concise) {
    return (
      <div />
    );
  }
  return (
    <div className="review-card">
      <div className="course-summary review">
        <div className="review-info-row">
          <div className="center-row overall">
            <GradeIndicator
              grade={review.overall}
              additionalClassName="course-summary-grade-indicator"
            />
          </div>
          <div className="center-row">
            <FaRegCalendarAlt />
            <p className="course-summary-label">{review.term}</p>
          </div>
          <div className="center-row">
            <FaChalkboardTeacher />
            <p className="course-summary-label">{review.lecturer}</p>
          </div>
          <p className="course-summary-label author">
            By
            {' '}
            <span>{review.anonymous ? 'Anonymous' : review.username}</span>
            {' on '}
            {getMMMDDYY(review.createdDate)}
          </p>
        </div>
        <GradeRow
          rating={review}
          isReview
          additionalClassName="review-header"
          selected={selectedCriteria}
          setSelected={setSelectedCriteria}
        >
          <LikeButtonsRow
            liked={liked}
            myVote={review.myVote}
            updateVote={updateVote}
            likeCaption={(review.upvotes || 0) + (review.myVote === null && liked === VOTE_ACTIONS.UPVOTE ? 1 : 0)}
            dislikeCaption={(review.downvotes || 0) + (review.myVote === null && liked === VOTE_ACTIONS.DOWNVOTE) ? 1 : 0}
          />
        </GradeRow>
      </div>
      <p className="review-text">{review[selectedCriteria].text}</p>
    </div>
  );
};

export default observer(ReviewCard);
