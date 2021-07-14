import React from 'react';
import Button from '@material-ui/core/Button';
import { ThumbUp, ThumbDown } from '@material-ui/icons';

import './LikeButtonRow.css';

const LikeButton = ({ isLike, selected, disabled, caption, onClick }) => (
  <Button
    size="small"
    onClick={onClick}
    variant={selected ? 'outlined' : 'text'}
    startIcon={isLike ? <ThumbUp /> : <ThumbDown />}
    className={`like-btn${selected ? ' active' : ''}`}
    disabled={disabled}
  >
    {caption}
  </Button>
);

export default function LikeButtonsRow({
  liked,
  myVote,
  updateVote,
  likeCaption,
  dislikeCaption,
}) {
  return (
    <div className="like-btn-row center-row">
      {[1, 0].map((label) => (
        <LikeButton
          key={label}
          isLike={Boolean(label)}
          selected={liked === label || myVote === label}
          disabled={liked !== null || myVote !== null}
          caption={label ? likeCaption : dislikeCaption}
          onClick={() => updateVote(label)}
        />
      ))}
    </div>
  );
}
