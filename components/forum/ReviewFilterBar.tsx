import { useState } from 'react';
import { ExpandMore } from '@material-ui/icons';
import { Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import { TiArrowSortedUp } from 'react-icons/ti';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { FaUserAlt } from 'react-icons/fa';

import '../../styles/components/forum/ReviewFilterBar.module.scss';
import { FiEdit } from 'react-icons/fi';
import clsx from 'clsx';

import { CourseInfo, ReviewsFilter } from '../../types';
import { reverseMapping } from '../../helpers';

const SORTING_FIELDS = { date: 'createdAt', upvotes: 'upvotes' };
const SORTING_FIELDS_REVERSE = reverseMapping(SORTING_FIELDS);

type ReviewFilterBarProps = {
  forwardedRef?: any;
  courseInfo: CourseInfo;
  reviewsPayload: Partial<ReviewsFilter>;
  dispatchReviewsPayload;
  fetchAllAction?: any;
  writeAction?: any;
  exceedLimit?: any;
  className?: any;
  isMobile?: any;
};

enum ReviewFilterBarMode {
  INITIAL,
  SORTING,
  LECTURER,
  TERM,
}

const ReviewFilterBar = ({
  forwardedRef,
  courseInfo,
  reviewsPayload,
  dispatchReviewsPayload,
  fetchAllAction,
  writeAction,
  exceedLimit,
  className,
  isMobile,
}: ReviewFilterBarProps) => {
  const [mode, setMode] = useState(ReviewFilterBarMode.INITIAL);
  const [anchorEl, setAnchorEl] = useState(null);

  const REVIEWS_CONFIGS = {
    [ReviewFilterBarMode.SORTING]: {
      key: 'sorting',
      selections: Object.keys(SORTING_FIELDS),
      icon: <TiArrowSortedUp />,
    },
    [ReviewFilterBarMode.LECTURER]: {
      key: 'lecturer',
      selections: courseInfo?.reviewLecturers || [],
      icon: <FaUserAlt size={12} />,
    },
    [ReviewFilterBarMode.TERM]: {
      key: 'term',
      selections: courseInfo?.reviewTerms || [],
      icon: <AiTwotoneCalendar />,
    },
  };

  const getLabel = (
    mode: ReviewFilterBarMode,
    reviewsPayload: Partial<ReviewsFilter>
  ) => {
    if (isMobile) {
      return '';
    }
    if (mode === ReviewFilterBarMode.SORTING) {
      console.log(reviewsPayload);
      return SORTING_FIELDS_REVERSE[reviewsPayload.sortBy] || 'date';
    }
    return reviewsPayload[REVIEWS_CONFIGS[mode].key] || 'All';
  };

  const onSelect = (field: string, selected: boolean) => {
    console.log(`Setted to ${field}`);
    if (mode === ReviewFilterBarMode.SORTING) {
      dispatchReviewsPayload({
        sortBy: selected ? 'createdAt' : SORTING_FIELDS[field],
      });
    } else {
      dispatchReviewsPayload({
        [REVIEWS_CONFIGS[mode].key]: selected ? '' : field,
      });
    }
    setAnchorEl(null);
  };

  return (
    <div
      ref={forwardedRef}
      className={clsx('panel card reviews-filter row', className)}
    >
      {courseInfo?.rating ? (
        <>
          <div className="filter-row center-row grid-auto-column">
            {!fetchAllAction &&
              Object.entries(REVIEWS_CONFIGS).map(([k, v]) => (
                <Button
                  key={v.key}
                  className={clsx(
                    'capsule-btn reviews-sort',
                    (reviewsPayload[v.key] ||
                      parseInt(k, 10) === ReviewFilterBarMode.SORTING) &&
                      'selected'
                  )}
                  size="small"
                  onClick={e => [
                    setMode(parseInt(k, 10)),
                    setAnchorEl(e.currentTarget),
                  ]}
                  startIcon={v.icon}
                  endIcon={<ExpandMore />}
                >
                  {getLabel(parseInt(k, 10), reviewsPayload)}
                </Button>
              ))}
            <div className="reviews-filter-label caption">
              {/* exceedLimit && `Limit exceeded (post 1 reviews to unlock)` */}
              {fetchAllAction && (
                <Button size="small" color="primary" onClick={fetchAllAction}>
                  Fetch All
                </Button>
              )}
            </div>
          </div>
          <Menu
            className="reviews-filter-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            TransitionProps={{
              onExited: () => setMode(ReviewFilterBarMode.INITIAL),
            }}
            disableScrollLock={true}
          >
            {(REVIEWS_CONFIGS[mode]?.selections || []).map((field: string) => {
              console.log(
                `sorting ${field} ${
                  SORTING_FIELDS_REVERSE[reviewsPayload.sortBy || 'createdAt']
                }`
              );
              const selected =
                mode === ReviewFilterBarMode.SORTING
                  ? SORTING_FIELDS_REVERSE[
                      reviewsPayload.sortBy || 'createdAt'
                    ] === field
                  : reviewsPayload[REVIEWS_CONFIGS[mode].key] === field;
              return (
                <MenuItem
                  key={field}
                  onClick={() => onSelect(field, selected)}
                  selected={selected}
                >
                  {field}
                </MenuItem>
              );
            })}
          </Menu>
        </>
      ) : (
        <span>No review yet</span>
      )}
      <span className="right grid-auto-column">
        <IconButton className="edit" size="small" onClick={writeAction}>
          <FiEdit />
        </IconButton>
      </span>
    </div>
  );
};

export default ReviewFilterBar;
