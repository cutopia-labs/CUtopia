import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Sort } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem } from '@material-ui/core';

import './CoursePanel.css';
import GradeIndicator from '../GradeIndicator';
import CourseCard from './CourseCard';
import { validCourse } from '../../helpers/marcos';
import { RATING_FIELDS } from '../../constants/states';
import { COURSE_INFO_QUERY, GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import Loading from '../Loading';

export const COURSE_PANEL_MODES = Object.freeze({
  WITH_REVIEW: 1,
  GET_TARGET_REVIEW: 2,
  FETCH_REVIEWS: 3,
});

const targetReview = '1231231';

const SORTING_FIELDS = Object.freeze([
  'date',
  'upvotes',
]);

/*
const courseInfo = {
  subjects: [
    {
      courses: [
        {
          units: '3.00',
          title: 'Introduction to Computer Systems',
          components: 'LaboratoryLecture',
          requirements: 'Prerequisite: (ENGG1110 or ESTR1002) AND (ENGG2440 or ESTR2004)',
          description: 'This course aims to provide students the basic knowledge of computer systems through the study of computer organization, assembly language and C programming. The course will mainly have two parts: (1) the structure of a computer that includes topics like data representations, digital logic structures, the Von Neumann model, assembly language, I/O, traps, subroutines and the stack; (2) system programming with C that includes topics like functions, pointers and arrays, file operations, dynamic memory management and data structures.',
          syllabus: 'This course aims to provide students the basic knowledge of computer systems through the study of computer organization, assembly language and C programming. The course will mainly have two parts: (1) the structure of a computer that includes topics like data representations, digital logic structures, the Von Neumann model, assembly language, I/O, traps, subroutines and the stack; (2) system programming with C that includes topics like functions, pointers and arrays, file operations, dynamic memory management and data structures.',
          outcome: 'At the end of the course of studies, students will have acquired the ability to\r 1. understand the underlying structure of a computer, the functions of its components, and the Von Neumann model; 2. write simple assembly programs and understand how assembly programs works; 3. develop system-level software with C.',
          required_readings: '1. Introduction to Computing Systems: From Bits and Gates to C and Beyond, Yale Patt and Sanjay Patel\r 2. Computer systems: a programmer’s perspective, Randal E. Bryant, David R. O’Hallaron',
          recommended_readings: '',
          academic_group: 'Dept of Computer Sci & Engg',
          rating: {
            numReviews: 12,
            overall: 3.2,
            grading: 2.7,
            content: 4,
            difficulty: 3,
            teaching: 3,
          },
          assessments: [
            {
              name: 'Essay test or exam',
              percentage: '40',
            },
            {
              name: 'Homework or assignment',
              percentage: '40',
            },
            {
              name: 'Lab reports',
              percentage: '10',
            },
            {
              name: 'Others',
              percentage: '10',
            },
          ],
          terms: [
            {
              name: '2020-21 Term 2',
              course_sections: [
                {
                  name: '--LEC (5034)',
                  startTimes: [
                    '11:30',
                    '16:30',
                  ],
                  endTimes: [
                    '12:15',
                    '18:15',
                  ],
                  days: [
                    '2',
                    '3',
                  ],
                  locations: [
                    'Online Teaching',
                    'Online Teaching',
                  ],
                  instructors: [
                    'Professor LEE Pak Ching',
                    'Professor LEE Pak Ching',
                  ],
                },
                {
                  name: '-L01-LAB (5035)',
                  startTimes: [
                    '16:30',
                  ],
                  endTimes: [
                    '17:15',
                  ],
                  days: [
                    '2',
                  ],
                  locations: [
                    'Online Teaching',
                  ],
                  instructors: [
                    'Professor LEE Pak Ching',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
 */

const CourseSummary = ({ courseInfo, sorting, setSorting }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = field => {
    console.log(`Setted to ${field}`);
    setSorting(field);
    setAnchorEl(null);
  };
  return (
    <div className="course-summary">
      <div className="course-summary-ratings row">
        <BarChart />
        {
          RATING_FIELDS.map(field => (
            <>
              <div className="course-summary-label" key={field}>{`${field}:`}</div>
              <GradeIndicator
                grade={courseInfo.rating[field]}
                additionalClassName="course-summary-grade-indicator"
              />
              <div />
            </>
          ))
        }
      </div>
      <IconButton
        aria-label="sort"
        components="span"
        size="small"
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <Sort />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          SORTING_FIELDS.map(field => (
            <MenuItem
              onClick={() => handleClose(field)}
              selected={sorting === field}
            >
              {field}
            </MenuItem>
          ))
        }
      </Menu>
    </div>
  );
};

export default function CoursePanel({ courseId }) {
  const [mode, setMode] = useState(COURSE_PANEL_MODES.FETCH_REVIEWS);
  const [sorting, setSorting] = useState('date');
  // Fetch course info
  const { data: courseInfo, courseInfoLoading, error } = useQuery(COURSE_INFO_QUERY, {
    variables: {
      subject: courseId.substring(0, 4),
      code: courseId.substring(4),
    },
    skip: !validCourse(courseId),
  });

  // Fetch all reviews
  const { data: reviews, loading: reviewsLoading, refetch } = useQuery(REVIEWS_QUERY, {
    variables: {
      courseId,
    },
    skip: mode !== COURSE_PANEL_MODES.FETCH_REVIEWS,
  });

  // Fetch a review based on reviewId
  const { data: review, loading: reviewLoading } = useQuery(GET_REVIEW, {
    variables: targetReview,
    skip: mode !== COURSE_PANEL_MODES.GET_TARGET_REVIEW,
  });

  useEffect(() => {
    courseInfo && console.log(courseInfo.subjects[0].courses[0]);
  }, [courseInfo]);

  return (
    <div className="course-panel card">
      {
        courseInfo && courseInfo.subjects && courseInfo.subjects[0] && courseInfo.subjects[0].courses && courseInfo.subjects[0].courses[0]
          ? (
            <>
              <CourseCard
                courseInfo={{
                  ...courseInfo.subjects[0].courses[0],
                  courseId,
                }}
              />
              {
                courseInfo.subjects[0].courses[0].rating
                && <CourseSummary courseInfo={courseInfo.subjects[0].courses[0]} sorting={sorting} setSorting={setSorting} />
              }
            </>
          )
          : <Loading />
      }
    </div>
  );
}
