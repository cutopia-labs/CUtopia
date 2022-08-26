import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import clsx from 'clsx';
import { FC, Fragment } from 'react';
import { BiDownvote, BiUpvote } from 'react-icons/bi';

import styles from '../../styles/components/review/LikeButtonRow.module.scss';

const LikeButton: FC<any> = ({
  isLike,
  selected,
  disabled,
  caption,
  onClick,
}) => (
  <Button
    size="small"
    onClick={onClick}
    variant={selected ? 'outlined' : 'text'}
    startIcon={isLike ? <BiUpvote /> : <BiDownvote />}
    className={clsx(styles.likeBtn, selected && 'active')}
    disabled={disabled}
  >
    {caption}
  </Button>
);

const LikeButtonsRow: FC<any> = ({
  liked,
  myVote,
  updateVote,
  likeCaption,
  dislikeCaption,
}) => {
  return (
    <div className={clsx(styles.likeBtnRow, 'center-row')}>
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
};

export default LikeButtonsRow;
