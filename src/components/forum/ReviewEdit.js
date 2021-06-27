import React, {
  useState, useEffect, useContext, useReducer, useRef,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Menu, MenuItem, Button, CircularProgress, IconButton, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery,
} from '@material-ui/core';
import { useMutation, useQuery } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import './ReviewEdit.css';
import { NotificationContext, UserContext } from '../../store';
import { GET_USER, GET_REVIEW } from '../../constants/queries';
import { ADD_REVIEW } from '../../constants/mutations';
import { GRADES, RATING_FIELDS, LETTER_TO_FIVE_VALUES } from '../../constants/states';
import colors from '../../constants/colors';
import TextField from '../TextField';
import Loading from '../Loading';
import INSTRUCTORS from '../../constants/instructors';
import { SearchResult } from './SearchPanel';
import ListItem from '../ListItem';
import { TARGET_REVIEW_WORD_COUNT } from '../../constants/configs';

const now = new Date();
const EARLIEST_YEAR = now.getFullYear() - 3; // most ppl writing reviews are current students?
const currentAcademicYear = now.getMonth() < 9 ? now.getFullYear() : now.getFullYear() + 1; // After Sept new sem started
const yearDifference = currentAcademicYear - EARLIEST_YEAR;
const academicYears = Array.from(new Array(yearDifference), (v, i) => EARLIEST_YEAR + yearDifference - (i + 1));

const DEFAULT_REVIEW = Object.freeze({
  grade: 3,
  text: '',
});

const MODES = Object.freeze({
  EDIT: 1,
  MODAL: 2, // to ask if need to edit or exit
});

const TERMS_OPTIONS = [
  ...academicYears.flatMap(year => ['Term 1', 'Term 2', 'Summer']
    .map(suffix => `${year.toString()}-${(year + 1).toString().substring(2)} ${suffix}`)),
  `Before ${EARLIEST_YEAR}`,
];

const wordCount = str => {
  const matches = str.match(/[\u00ff-\uffff]|\S+/g);
  return matches ? matches.length : 0;
};

const FormSection = ({ title, className, children }) => (
  <>
    <span className={`form-section-title ${className}`}>{title}</span>
    {children}
  </>
);

const SelectionGroup = ({ selections, selectedIndex, onSelect }) => (
  <div className="selection-group center-row">
    {
      selections.map((selection, i) => (
        <span
          className={`selecion-item${selectedIndex === i ? ' selected' : ''}`}
          onClick={() => onSelect(i)}
          style={selectedIndex === i ? {
            backgroundColor: colors.gradeColors[selection],
          } : null}
        >
          {selection}
        </span>
      ))
    }
  </div>
);

const searchLecturers = ({ payload, limit }) => {
  const results = [];
  let resultsLen = 0;
  for (let i = 0; (i <= INSTRUCTORS.length && resultsLen <= limit); i++) {
    if ((INSTRUCTORS[i] || '').toLowerCase().includes(payload.toLowerCase())) {
      results.push(INSTRUCTORS[i]);
      resultsLen++;
    }
  }
  return results;
};

const ReviewSection = ({
  type, value, onChangeText, onChangeGrade,
}) => (
  <div className="review-section-container">
    <div className="review-section-header center-row">
      <span className="review-section-title form-section-title">{type}</span>
      <SelectionGroup
        onSelect={onChangeGrade}
        selectedIndex={type === 'overall' ? value : value.grade}
        selections={GRADES}
      />
    </div>
    {
      type !== 'overall' &&
        (
          <TextField
            className="review-section-input"
            Tag="textarea"
            placeholder={`Leave your opinion about ${type} here.`}
            value={value.text}
            onChangeText={onChangeText}
          />
        )
    }
  </div>
);

const ReviewEdit = ({
  courseId,
}) => {
  const [mode, setMode] = useState();
  const [targetReview, setTargetReview] = useState();
  const [progress, setProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLecturers, setShowLecturers] = useState(false);
  const [addReview, { loading, error }] = useMutation(ADD_REVIEW);
  const isMobile = useMediaQuery('(max-width:1260px)');
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
      ...Object.fromEntries(RATING_FIELDS.map(type => [type, DEFAULT_REVIEW])),
    },
  );
  const notification = useContext(NotificationContext);
  const user = useContext(UserContext);
  const history = useHistory();
  const lecturerInputRef = useRef();

  // Get user's reviewIds to see if he already reviewed this course
  const { data: userData, userLoading } = useQuery(GET_USER, {
    variables: {
      username: user.cutopiaUsername,
    },
  });

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: {
      courseId,
      createdDate: targetReview,
    },
    skip: mode !== MODES.EDIT || !targetReview,
  });

  const submit = async e => {
    e.preventDefault();
    if (progress < 100) {
      notification.setSnackBar(`Please write at least ${TARGET_WORD_COUNT} words before submit~`);
      return;
    }
    // below are temp b4 server schema updated
    console.log(JSON.stringify(formData));

    const res = await addReview({
      variables: formData,
    });
    console.log(res);
    if (res && res.data && res.data.createReview && res.data.createReview.createdDate) {
      history.push(`/review/${courseId}/${res.data.createReview.createdDate}`);
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
        if (typeof (value) === 'object') {
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
    if (userData && !userLoading) {
      if (!userData.user) {
        alert('Invalid Login Information!');f
        history.push(`/review/${courseId}`);
      }
      else if (userData.user.reviewIds && userData.user.reviewIds.length) {
        for (let i = 0; i < userData.user.reviewIds.length; i++) {
          if (userData.user.reviewIds[i].startsWith(courseId)) {
            const parts = userData.user.reviewIds[i].split('#');
            setTargetReview(parts[1]);
            setMode(MODES.MODAL);
          }
        }
      }
    }
  }, [userData]);

  // to fillin posted review if choose to edit
  useEffect(() => {
    if (!reviewLoading && review && review.review) {
      console.log(review.review);
      dispatchFormData(review.review);
    }
  }, [review]);

  useEffect(() => {
    error && alert(error);
  }, [error]);

  useEffect(() => {
    const overallAverage = RATING_FIELDS.map(type => formData[type].grade).reduce((acc, v) => acc + v) / RATING_FIELDS.length;
    dispatchFormData({ overall: Math.round(overallAverage) }); // later detemine round or floor
  }, RATING_FIELDS.map(type => formData[type].grade));

  useEffect(() => {
    const combinedReviewText = RATING_FIELDS.map(type => formData[type].text).reduce((acc, v) => acc + v);
    const count = wordCount(combinedReviewText);
    setProgress((count * 100) / TARGET_REVIEW_WORD_COUNT);
  }, RATING_FIELDS.map(type => formData[type].text));

  return (
    <div className="review-edit">
      {
        reviewLoading && <Loading absolute />
      }
      <Dialog
        open={mode === MODES.MODAL}
        onClose={() => history.push(`/review/${courseId}`)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">You have already reviewed this course!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to edit your posted review?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => history.push(`/review/${courseId}`)} color="primary">
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
        onClose={() => setAnchorEl()}
      >
        {TERMS_OPTIONS.map((option, i) => (
          <MenuItem
            key={option}
            selected={option === formData.term}
            onClick={() => [dispatchFormData({ term: option }), setAnchorEl()]}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
      <FormSection title="title">
        <TextField
          placeholder="(Optional) Your Review Title"
          value={formData.title}
          onChangeText={text => dispatchFormData({ title: text })}
        />
      </FormSection>
      <FormSection title="lecturer" className="lecturer">
        <TextField
          placeholder="Please input your course instructor here."
          value={formData.lecturer}
          onChangeText={text => dispatchFormData({ lecturer: text })}
          ref={lecturerInputRef}
          onFocus={() => setShowLecturers(true)}
          onBlur={() => setShowLecturers(false)}
        />
        {
          showLecturers && Boolean(formData.lecturer) && (
            <div className="header-search-result card">
              {
                searchLecturers({ payload: formData.lecturer, limit: isMobile ? 4 : 6 })
                  .filter(item => formData.lecturer !== item)
                  .map(lecturer => (
                    <ListItem
                      key={`listitem-${lecturer}`}
                      onMouseDown={() => dispatchFormData({ lecturer })}
                    >
                      <div className="search-list-item column">
                        <span className="title">{lecturer}</span>
                      </div>
                    </ListItem>
                  ))
              }
            </div>
          )
        }
      </FormSection>
      <div className="review-sections-container">
        {
          RATING_FIELDS
            .map(type => (
              <ReviewSection
                key={type}
                type={type}
                value={formData[type]}
                onChangeText={text => dispatchFormData({ [type]: { ...formData[type], text } })}
                onChangeGrade={grade => dispatchFormData({ [type]: { ...formData[type], grade } })}
              />
            ))
        }
      </div>
      <div className="submit-btn-row center-row">
        <ReviewSection
          type="overall"
          value={formData.overall}
          onChangeGrade={grade => dispatchFormData({ overall: grade })}
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
          {
            loading
              ? <CircularProgress color="secondary" size={24} />
              : (progress < 100 ? 'write more!' : 'submit')
          }
        </Button>
      </div>
    </div>
  );
};

export default observer(ReviewEdit);
