import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Fragment } from 'react';
import { BiDownvote, BiUpvote } from 'react-icons/bi';

import '../../styles/components/forum/LikeButtonRow.module.scss';

const LikeButton = ({ isLike, selected, disabled, caption, onClick }) => (
  <Button
    size="small"
    onClick={onClick}
    variant={selected ? 'outlined' : 'text'}
    startIcon={isLike ? <BiUpvote /> : <BiDownvote />}
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
      {[1, 0].map(label => (
        <Fragment key={label}>
          <LikeButton
            isLike={Boolean(label)}
            selected={liked === label || myVote === label}
            disabled={liked !== null || myVote !== null}
            caption={label ? likeCaption : dislikeCaption}
            onClick={() => updateVote(label)}
          />
          {Boolean(label) && <Divider orientation="horizontal" />}
        </Fragment>
      ))}
    </div>
  );
}
