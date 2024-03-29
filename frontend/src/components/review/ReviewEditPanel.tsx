import { useState, useEffect, useReducer, useRef, FC } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Menu,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { useBeforeUnload } from 'react-use';

import styles from '../../styles/components/review/ReviewEditPanel.module.scss';
import { useView, useUser, useData } from '../../store';
import { GET_REVIEW } from '../../constants/queries';
import { ADD_REVIEW, EDIT_REVIEW } from '../../constants/mutations';
import { GRADES, RATING_FIELDS } from '../../constants';
import TextField from '../atoms/TextField';
import Loading from '../atoms/Loading';
import ListItem from '../molecules/ListItem';
import {
  SAVE_DRAFT_PROGRESS_BUFFER,
  TARGET_REVIEW_WORD_COUNT,
} from '../../config';
import {
  CourseInfo,
  RatingFieldWithOverall,
  Review,
  ReviewDetails,
} from '../../types';
import SelectionGroup, { FormSection } from '../molecules/SectionGroup';
import useMobileQuery from '../../hooks/useMobileQuery';
import handleCompleted from '../../helpers/handleCompleted';
import LoadingButton from '../atoms/LoadingButton';
import Page from '../../components/atoms/Page';
import LoadingView from '../atoms/LoadingView';
import CourseCard from './CourseCard';

enum MODES {
  INITIAL,
  EDIT,
  EDIT_MODAL, // to ask if need to edit or exit
  DRAFT_MODAL,
}

const WORD_COUNT_RULE = new RegExp('[\\u00ff-\\uffff]|\\S+', 'g');

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
  ...academicYears.flatMap(year =>
    ['Summer', 'Term 2', 'Term 1'].map(
      suffix =>
        `${year.toString()}-${(year + 1).toString().substring(2)} ${suffix}`
    )
  ),
  `Before ${EARLIEST_YEAR}`,
];

const wordCount = (str: string) => {
  const matches = str.match(WORD_COUNT_RULE);
  return matches ? matches.length : 0;
};

type ReviewSectionProps = {
  type: RatingFieldWithOverall;
  value: ReviewDetails | number;
  onChangeText?: (text: string) => any;
  onChangeGrade: (grade: number) => any;
};

const ReviewHelperText = {
  grading: 'Assessments and their weighting, how grade is distributed, etc.',
  teaching: 'Interactive, funny, boring or hard to follow',
  difficulty:
    'Difficulty of assessments (homework, exam). Workload is too heavy to handle?',
  content: 'Topics, insights, skills rewarded in the course',
  overall: 'Your overall rating about this course',
};

const ReviewSection: FC<ReviewSectionProps> = ({
  type,
  value,
  onChangeText,
  onChangeGrade,
}) => (
  <div className={clsx(styles.reviewSectionContainer, 'grid-auto-row')}>
    <div className={clsx(styles.reviewSectionHeader, 'center-row')}>
      <Tooltip
        enterTouchDelay={0}
        title={ReviewHelperText[type]}
        placement="right"
      >
        <span
          className={clsx(
            styles.reviewSectionTitle,
            styles.formSectionTitle,
            'center-row'
          )}
        >
          {type}
          {Boolean(ReviewHelperText[type]) && <HiOutlineInformationCircle />}
        </span>
      </Tooltip>
      <SelectionGroup
        onSelect={onChangeGrade}
        selectedIndex={typeof value === 'number' ? value : value.grade}
        selections={GRADES}
      />
    </div>
    {typeof value !== 'number' && (
      <TextField
        className={styles.reviewInputContainer}
        Tag="textarea"
        placeholder={`Leave your opinion about ${type} here.`}
        value={value.text}
        onChangeText={onChangeText}
      />
    )}
  </div>
);

type ReviewSubmitProps = {
  warning: string | false;
  progress: number;
  onSubmit: (e) => void;
  loading: boolean;
};

const ReviewSubmit: FC<ReviewSubmitProps> = ({
  warning,
  progress,
  onSubmit,
  loading,
}) => (
  <LoadingButton
    loading={loading}
    className={styles.submitBtn}
    onClick={onSubmit}
    variant="contained"
    disabled={Boolean(warning)}
  >
    {progress >= 100 ? 'Submit ♡' : warning || 'Write More Plz'}
    {!warning && !loading && progress < 100 && (
      <span
        className={styles.progress}
        style={{
          width: `calc(${progress}% + 32px)`, // 32px is MuiLabel pdding
        }}
      />
    )}
  </LoadingButton>
);

type Props = {
  courseInfo: CourseInfo;
};

const ReviewEditPanel: FC<Props> = ({ courseInfo }) => {
  const courseId = courseInfo.courseId;
  const view = useView();
  const [mode, setMode] = useState(MODES.INITIAL);
  const [targetReview, setTargetReview] = useState<string | Review>('');
  const [progress, setProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [instructorsSearchResult, setInstructorsSearchResult] = useState<
    string[]
  >([]);
  const [showLecturers, setShowLecturers] = useState(false);
  const [addReview, { loading: addReviewLoading, error: addReviewError }] =
    useMutation(ADD_REVIEW, {
      onCompleted: handleCompleted(
        data => {
          const id = data?.createReview?.createdAt;
          if (id) {
            user.deleteReveiwDraft(courseId);
            router.push(`/review/${courseId}?rid=${id}`, undefined, {
              shallow: true,
            });
          }
        },
        {
          view,
          message: 'Review added!',
        }
      ),
      onError: view.handleError,
    });
  const [editReview, { loading: editReviewLoading, error: editReviewError }] =
    useMutation(EDIT_REVIEW, {
      onCompleted: handleCompleted(
        () => {
          if (formData.createdAt) {
            user.deleteReveiwDraft(courseId);
            router.push(
              `/review/${courseId}?rid=${formData.createdAt}`,
              undefined,
              { shallow: true }
            );
          }
        },
        {
          view,
          message:
            'Review edited! (Changes may take several minites to take effect)',
        }
      ),
      onError: view.handleError,
    });
  const isMobile = useMobileQuery();
  const [formData, dispatchFormData] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {
      courseId,
      anonymous: false,
      term: '',
      lecturer: '',
      title: '',
      overall: 3,
      ...Object.fromEntries(RATING_FIELDS.map(type => [type, DEFAULT_REVIEW])),
    }
  );
  const user = useUser();
  const data = useData();
  const router = useRouter();
  const lecturerInputRef = useRef();

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdAt: targetReview,
    },
    skip: mode !== MODES.EDIT || !targetReview,
    onError: view.handleError,
  });

  const submit = e => {
    e.preventDefault();
    if (progress < 100) {
      view.warn(
        `Please write at least ${TARGET_REVIEW_WORD_COUNT} words before submit`
      );
      return;
    }
    // If user editing old review
    if (mode === MODES.EDIT) {
      const { title, term, section, lecturer, ...editReviewForm } = formData;

      editReview({
        variables: {
          ...editReviewForm,
        },
      });
    }
    // If user composing new review
    else {
      addReview({
        variables: formData,
      });
    }
  };

  const hasEmpty = () => {
    if (typeof formData === 'object' && formData) {
      for (const [key, value] of Object.entries(formData)) {
        if (value === '' && !(key === 'title' || key === 'anonymous')) {
          return `Missing ${key}`;
        }
        if (typeof value === 'object') {
          for (const [innerKey, innerValue] of Object.entries(value || {})) {
            if (innerValue === '') {
              return `Missing ${key}`;
            }
          }
        }
      }
      return false;
    }
    return 'Invalid form';
  };

  // Check userData to see if user already posted review
  useEffect(() => {
    const reviewIds = user?.data?.reviewIds;
    if (reviewIds?.length) {
      for (let i = 0; i < reviewIds.length; i++) {
        if (reviewIds[i].startsWith(courseId)) {
          const [_, reviewId] = reviewIds[i].split('#');
          setTargetReview(reviewId);
          setMode(MODES.EDIT_MODAL);
          return;
        }
      }
    }
  }, [user.data?.reviewIds]);

  // Check draft onMount to see if user have saved draft for this course
  useEffect(() => {
    if (user.reviewDrafts[courseId]) {
      setTargetReview(user.reviewDrafts[courseId]);
      setMode(MODES.DRAFT_MODAL);
    }
  }, []);

  // to fillin posted review if choose to edit
  useEffect(() => {
    if (!reviewLoading && review && review.review) {
      dispatchFormData(review.review);
    }
  }, [review]);

  useEffect(
    () => {
      const overallAverage =
        RATING_FIELDS.map(type => formData[type].grade).reduce(
          (acc, v) => acc + v
        ) / RATING_FIELDS.length;
      dispatchFormData({ overall: Math.round(overallAverage) }); // later detemine round or floor
    },
    RATING_FIELDS.map(type => formData[type].grade)
  );

  useEffect(
    () => {
      const combinedReviewText = RATING_FIELDS.map(
        type => formData[type].text
      ).reduce((acc, v) => acc + v);
      const count = wordCount(combinedReviewText);
      setProgress((count * 100) / TARGET_REVIEW_WORD_COUNT);
    },
    RATING_FIELDS.map(type => formData[type].text)
  );

  useEffect(() => {
    data
      .searchLecturers({
        payload: formData.lecturer,
        limit: isMobile ? 4 : 6,
      })
      .then(result => setInstructorsSearchResult(result));
  }, [formData.lecturer]);

  useBeforeUnload(() => {
    const unsaved =
      progress > SAVE_DRAFT_PROGRESS_BUFFER && mode === MODES.INITIAL;

    if (unsaved) {
      user.updateReviewDrafts(courseId, formData);
    }
    return unsaved;
  }, 'You have unsaved review, are you sure you want to leave?');

  const reviewModal = {
    [MODES.EDIT_MODAL]: {
      title: 'You have already reviewed this course!',
      caption: 'Do you want to edit your posted review?',
      cancelButton: {
        label: 'Cancel',
        action: () =>
          router.push(`/review/${courseId}`, undefined, { shallow: true }),
      },
      confirmButton: {
        label: 'Edit',
        action: () => setMode(MODES.EDIT),
      },
      onClose: () =>
        router.push(`/review/${courseId}`, undefined, { shallow: true }),
    },
    [MODES.DRAFT_MODAL]: {
      title: 'Review draft found!',
      caption: 'Do you want use your draft?',
      cancelButton: {
        label: 'Discard',
        action: () => {
          user.deleteReveiwDraft(courseId);
          setMode(MODES.INITIAL);
        },
      },
      confirmButton: {
        label: 'Yes',
        action: () => {
          setMode(MODES.INITIAL);
          dispatchFormData(targetReview);
        },
      },
      onClose: () => {
        setMode(MODES.INITIAL);
      },
    },
  };

  return (
    <Page className={styles.reviewEditPage} center padding>
      <div className="reviewEdit-panel coursePanel panel card">
        <CourseCard courseInfo={courseInfo} />
        <div className={clsx(styles.reviewEdit, 'grid-auto-row')}>
          {reviewLoading && <Loading fixed />}
          <div className={clsx(styles.reviewHeaderContainer, 'center-row')}>
            <span className="title">Your Review</span>
            <span className="light-caption">前人種樹，後人乘涼</span>
            <Tooltip title="Anonymity">
              <IconButton
                className={styles.anonymousSwitch}
                aria-label="anonymous"
                onClick={() =>
                  dispatchFormData({ anonymous: !formData.anonymous })
                }
                size="large"
              >
                {formData.anonymous ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>
          </div>
          <FormSection title="term" className={styles.formSectionTitle}>
            <div
              className={clsx(styles.termSelectionAnchor, 'input-container')}
              onClick={e => setAnchorEl(e.currentTarget)}
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
          <FormSection title="title" className={styles.formSectionTitle}>
            <TextField
              placeholder="(Optional) Your Review Title"
              value={formData.title}
              onChangeText={text => dispatchFormData({ title: text })}
            />
          </FormSection>
          <FormSection
            title="lecturer"
            className={clsx('lecturer', styles.formSectionTitle)}
          >
            <TextField
              placeholder="Please input your course instructor here."
              value={formData.lecturer}
              onChangeText={text => dispatchFormData({ lecturer: text })}
              inputRef={lecturerInputRef}
              onFocus={() => setShowLecturers(true)}
              onBlur={() => setShowLecturers(false)}
            />
            {showLecturers && Boolean(formData.lecturer) && (
              <div className={clsx(styles.headerSearchResult, 'card')}>
                <LoadingView loading={!instructorsSearchResult}>
                  {instructorsSearchResult
                    .filter(item => formData.lecturer !== item)
                    .map(lecturer => (
                      <ListItem
                        key={`listitem-${lecturer}`}
                        onMouseDown={() => dispatchFormData({ lecturer })}
                        title={lecturer}
                      />
                    ))}
                </LoadingView>
              </div>
            )}
          </FormSection>
          <div
            className={clsx(styles.reviewSectionsContainer, 'grid-auto-row')}
          >
            {RATING_FIELDS.map(type => (
              <ReviewSection
                key={type}
                type={type}
                value={formData[type]}
                onChangeText={text =>
                  dispatchFormData({ [type]: { ...formData[type], text } })
                }
                onChangeGrade={grade =>
                  dispatchFormData({ [type]: { ...formData[type], grade } })
                }
              />
            ))}
          </div>
          <div className={clsx(styles.submitBtnRow, 'center-row')}>
            <ReviewSection
              type="overall"
              value={formData.overall}
              onChangeGrade={grade => dispatchFormData({ overall: grade })}
            />
            <ReviewSubmit
              warning={hasEmpty()}
              onSubmit={submit}
              progress={progress}
              loading={addReviewLoading || editReviewLoading}
            />
          </div>
          {(mode === MODES.DRAFT_MODAL || mode === MODES.EDIT_MODAL) && (
            <Dialog
              open={mode === MODES.EDIT_MODAL || mode === MODES.DRAFT_MODAL}
              onClose={reviewModal[mode].onClose}
              className={styles.reviewEditDialog}
            >
              <DialogTitle id="alert-dialog-title">
                {reviewModal[mode].title}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialogDescription">
                  {reviewModal[mode].caption}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={reviewModal[mode].cancelButton.action}
                  color="primary"
                >
                  {reviewModal[mode].cancelButton.label}
                </Button>
                <Button
                  onClick={reviewModal[mode].confirmButton.action}
                  color="primary"
                  autoFocus
                >
                  {reviewModal[mode].confirmButton.label}
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </div>
      </div>
    </Page>
  );
};

export default observer(ReviewEditPanel);
