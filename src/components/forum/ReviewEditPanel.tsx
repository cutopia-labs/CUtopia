import { useState, useEffect, useContext, useReducer, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Menu,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@material-ui/core';
import { useMutation, useQuery } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import './ReviewEdit.scss';
import { NotificationContext, UserContext } from '../../store';
import { GET_REVIEW, COURSE_INFO_QUERY } from '../../constants/queries';
import { ADD_REVIEW, EDIT_REVIEW } from '../../constants/mutations';
import { GRADES, RATING_FIELDS } from '../../constants/states';
import TextField from '../atoms/TextField';
import Loading from '../atoms/Loading';
import INSTRUCTORS from '../../constants/instructors';
import ListItem from '../molecules/ListItem';
import {
  MIN_DESKTOP_WIDTH,
  TARGET_REVIEW_WORD_COUNT,
} from '../../constants/configs';
import { RatingFieldWithOverall, ReviewDetails } from '../../types';
import SelectionGroup, { FormSection } from '../molecules/SectionGroup';
import CourseCard from './CourseCard';

enum MODES {
  INITIAL,
  EDIT,
  MODAL, // to ask if need to edit or exit
}

const now = new Date();
const EARLIEST_YEAR = now.getFullYear() - 3; // most ppl writing reviews are current students?
const currentAcademicYear =
  now.getMonth() < 9 ? now.getFullYear() : now.getFullYear() + 1; // After Sept new sem started
const yearDifference = currentAcademicYear - EARLIEST_YEAR;
const academicYears = Array.from(
  new Array(yearDifference),
  (v, i) => EARLIEST_YEAR + yearDifference - (i + 1)
);

const DEFAULT_REVIEW = Object.freeze({
  grade: 3,
  text: '',
});

const TERMS_OPTIONS = [
  ...academicYears.flatMap((year) =>
    ['Term 1', 'Term 2', 'Summer'].map(
      (suffix) =>
        `${year.toString()}-${(year + 1).toString().substring(2)} ${suffix}`
    )
  ),
  `Before ${EARLIEST_YEAR}`,
];

const wordCount = (str: string) => {
  const matches = str.match(/[\u00ff-\uffff]|\S+/g);
  return matches ? matches.length : 0;
};

const searchLecturers = ({
  payload,
  limit,
}: {
  payload: string;
  limit: number;
}): string[] => {
  const results = [];
  let resultsLen = 0;
  for (let i = 0; i <= INSTRUCTORS.length && resultsLen <= limit; i++) {
    if ((INSTRUCTORS[i] || '').toLowerCase().includes(payload.toLowerCase())) {
      results.push(INSTRUCTORS[i]);
      resultsLen++;
    }
  }
  return results;
};

type ReviewSectionProps = {
  type: RatingFieldWithOverall;
  value: ReviewDetails | number;
  onChangeText?: (text: string) => any;
  onChangeGrade: (grade: number) => any;
};

const ReviewSection = ({
  type,
  value,
  onChangeText,
  onChangeGrade,
}: ReviewSectionProps) => (
  <div className="review-section-container grid-auto-row">
    <div className="review-section-header center-row">
      <span className="review-section-title form-section-title">{type}</span>
      <SelectionGroup
        onSelect={onChangeGrade}
        selectedIndex={typeof value === 'number' ? value : value.grade}
        selections={GRADES}
      />
    </div>
    {typeof value !== 'number' && (
      <TextField
        className="review-section-input"
        Tag="textarea"
        placeholder={`Leave your opinion about ${type} here.`}
        value={value.text}
        onChangeText={onChangeText}
      />
    )}
  </div>
);

const ReviewEdit = ({ courseId }) => {
  const notification = useContext(NotificationContext);
  const [mode, setMode] = useState(MODES.INITIAL);
  const [targetReview, setTargetReview] = useState('');
  const [progress, setProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLecturers, setShowLecturers] = useState(false);
  const [addReview, { loading: addReviewLoading, error: addReviewError }] =
    useMutation(ADD_REVIEW, {
      onError: notification.handleError,
    });
  const [editReview, { loading: editReviewLoading, error: editReviewError }] =
    useMutation(EDIT_REVIEW, {
      onError: notification.handleError,
    });
  const isMobile = useMediaQuery(`(max-width:${MIN_DESKTOP_WIDTH}px)`);
  const [formData, dispatchFormData] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {
      courseId,
      anonymous: false,
      section: 'Hi',
      term: '',
      lecturer: '',
      title: '',
      overall: 3,
      ...Object.fromEntries(
        RATING_FIELDS.map((type) => [type, DEFAULT_REVIEW])
      ),
    }
  );
  const user = useContext(UserContext);
  const history = useHistory();
  const lecturerInputRef = useRef();

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdDate: targetReview,
    },
    skip: mode !== MODES.EDIT || !targetReview,
    onError: notification.handleError,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (progress < 100) {
      notification.setSnackBar(
        `Please write at least ${TARGET_REVIEW_WORD_COUNT} words before submit~`
      );
      return;
    }
    // below are temp b4 server schema updated
    let res;
    if (mode === MODES.EDIT) {
      const { title, term, section, lecturer, ...editReviewForm } = formData;
      console.log(JSON.stringify(editReviewForm));
      res = await editReview({
        variables: {
          ...editReviewForm,
        },
      });
    } else {
      console.log(JSON.stringify(formData));
      res = await addReview({
        variables: formData,
      });
    }
    console.log(res);
    const id =
      mode === MODES.EDIT
        ? res?.data?.editReview?.modifiedDate
        : res?.data?.createReview?.createdDate;

    if (id) {
      history.push(`/review/${courseId}/${id}`);
      notification.setSnackBar('Review added!');
    }
  };

  const validation = () => {
    if (typeof formData === 'object' && formData) {
      for (const [key, value] of Object.entries(formData)) {
        if (value === '' && !(key === 'title' || key === 'anonymous')) {
          console.log(key);
          return false;
        }
        if (typeof value === 'object') {
          for (const [innerKey, innerValue] of Object.entries(value || {})) {
            if (innerValue === '') {
              console.log(`${key}.${innerKey}`);
              return false;
            }
          }
        }
      }
      return true;
    }
    return false;
  };

  // Check userData to see if user already posted review
  useEffect(() => {
    const reviewIds = user?.data?.reviewIds;
    if (reviewIds && reviewIds?.length) {
      const reviewIds = user.data?.reviewIds;
      for (let i = 0; i < reviewIds.length; i++) {
        if (reviewIds[i].startsWith(courseId)) {
          const parts = reviewIds[i].split('#');
          setTargetReview(parts[1]);
          setMode(MODES.MODAL);
        }
      }
    }
  }, [user.data.reviewIds]);

  // to fillin posted review if choose to edit
  useEffect(() => {
    if (!reviewLoading && review && review.review) {
      console.log(review.review);
      dispatchFormData(review.review);
    }
  }, [review]);

  useEffect(() => {
    const e = addReviewError || editReviewError;
    e && alert(e);
  }, [addReviewError, editReviewError]);

  useEffect(
    () => {
      const overallAverage =
        RATING_FIELDS.map((type) => formData[type].grade).reduce(
          (acc, v) => acc + v
        ) / RATING_FIELDS.length;
      dispatchFormData({ overall: Math.round(overallAverage) }); // later detemine round or floor
    },
    RATING_FIELDS.map((type) => formData[type].grade)
  );

  useEffect(
    () => {
      const combinedReviewText = RATING_FIELDS.map(
        (type) => formData[type].text
      ).reduce((acc, v) => acc + v);
      const count = wordCount(combinedReviewText);
      setProgress((count * 100) / TARGET_REVIEW_WORD_COUNT);
    },
    RATING_FIELDS.map((type) => formData[type].text)
  );

  return (
    <div className="review-edit grid-auto-row">
      {reviewLoading && <Loading fixed />}
      <Dialog
        open={mode === MODES.MODAL}
        onClose={() => history.push(`/review/${courseId}`)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          You have already reviewed this course!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to edit your posted review?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => history.push(`/review/${courseId}`)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={() => setMode(MODES.EDIT)} color="primary" autoFocus>
            Edit
          </Button>
        </DialogActions>
      </Dialog>
      <div className="review-header-container center-row">
        <span className="title">Your Review</span>
        <span className="caption">前人種樹，後人乘涼--</span>
        <IconButton
          className="anonymous-switch"
          aria-label="anonymous"
          onClick={() => dispatchFormData({ anonymous: !formData.anonymous })}
        >
          {formData.anonymous ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </div>
      <FormSection title="term">
        <div
          className="term-selection-anchor input-container"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {formData.term || 'Please select a term'}
        </div>
      </FormSection>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {TERMS_OPTIONS.map((option, i) => (
          <MenuItem
            key={option}
            selected={option === formData.term}
            onClick={() => [
              dispatchFormData({ term: option }),
              setAnchorEl(null),
            ]}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
      <FormSection title="title">
        <TextField
          placeholder="(Optional) Your Review Title"
          value={formData.title}
          onChangeText={(text) => dispatchFormData({ title: text })}
        />
      </FormSection>
      <FormSection title="lecturer" className="lecturer">
        <TextField
          placeholder="Please input your course instructor here."
          value={formData.lecturer}
          onChangeText={(text) => dispatchFormData({ lecturer: text })}
          ref={lecturerInputRef}
          onFocus={() => setShowLecturers(true)}
          onBlur={() => setShowLecturers(false)}
        />
        {showLecturers && Boolean(formData.lecturer) && (
          <div className="header-search-result card">
            {searchLecturers({
              payload: formData.lecturer,
              limit: isMobile ? 4 : 6,
            })
              .filter((item) => formData.lecturer !== item)
              .map((lecturer) => (
                <ListItem
                  key={`listitem-${lecturer}`}
                  onMouseDown={() => dispatchFormData({ lecturer })}
                  title={lecturer}
                />
              ))}
          </div>
        )}
      </FormSection>
      <div className="review-sections-container grid-auto-row">
        {RATING_FIELDS.map((type) => (
          <ReviewSection
            key={type}
            type={type}
            value={formData[type]}
            onChangeText={(text) =>
              dispatchFormData({ [type]: { ...formData[type], text } })
            }
            onChangeGrade={(grade) =>
              dispatchFormData({ [type]: { ...formData[type], grade } })
            }
          />
        ))}
      </div>
      <div className="submit-btn-row center-row">
        <ReviewSection
          type="overall"
          value={formData.overall}
          onChangeGrade={(grade) => dispatchFormData({ overall: grade })}
        />
        <Button
          variant="contained"
          className={`submit-btn${progress >= 100 ? ' filled' : ''}`}
          color="secondary"
          onClick={submit}
          disabled={!validation()}
          style={{
            background: `linear-gradient(to right, var(--accent) ${progress}%, transparent ${progress}%)`,
          }}
        >
          {addReviewLoading || editReviewLoading ? (
            <CircularProgress color="inherit" size={24} />
          ) : progress < 100 ? (
            'write more!'
          ) : (
            'submit'
          )}
        </Button>
      </div>
    </div>
  );
};

const ReviewEditPanel = () => {
  const { id: courseId, reviewId } = useParams<{
    id?: string;
    reviewId?: string;
  }>();
  const notification = useContext(NotificationContext);
  // Fetch course info
  const { data: courseInfo, loading: courseInfoLoading } = useQuery(
    COURSE_INFO_QUERY,
    {
      skip: !courseId,
      ...(courseId && {
        variables: {
          subject: courseId.substring(0, 4),
          code: courseId.substring(4),
        },
      }),
      fetchPolicy: 'cache-first',
      onError: notification.handleError,
    }
  );
  return (
    <div className="review-edit-panel course-panel panel card">
      {!courseInfoLoading &&
        courseInfo &&
        courseInfo.subjects &&
        courseInfo.subjects[0] && (
          <CourseCard
            courseInfo={{
              ...courseInfo.subjects[0].courses[0],
              courseId,
            }}
          />
        )}
      <ReviewEdit courseId={courseId} />
    </div>
  );
};

export default observer(ReviewEditPanel);
