import React, {
  useState, useEffect, useContext, useRef, useLayoutEffect,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import pluralize from 'pluralize';
import { observer } from 'mobx-react-lite';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import {
  ShoppingCart, ShoppingCartOutlined, Favorite, FavoriteOutlined,
} from '@material-ui/icons';

import ShowMoreOverlay from '../ShowMoreOverlay';
import Loading from '../Loading';
import Badge from '../Badge';
import { UserContext } from '../../store';
import { validCourse } from '../../helpers/marcos';
import { COURSE_INFO_QUERY, GET_REVIEW, REVIEWS_QUERY } from '../../constants/queries';
import './CourseCard.css';

const loading = false;

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

const CourseCard = ({ courseId }) => {
  const [showMore, setShowMore] = useState(true);
  const user = useContext(UserContext);
  const containerRef = useRef();

  // Fetch course info
  /* const { data: courseInfo, loading, error } = useQuery(COURSE_INFO_QUERY, {
    variables: {
      subject: courseId.substring(0, 4),
      code: courseId.substring(4),
    },
    skip: !validCourse(courseId),
  }); */

  const isFavorited = user.favoriteCourses.some(course => course.courseId === courseId);
  const setFavorited = async () => {
    if (isFavorited) {
      await user.saveFavoriteCourses([...user.favoriteCourses].filter(course => course.courseId !== courseId));
    }
    else {
      console.log('Setting');
      const temp = {
        courseId,
        title: courseInfo.subjects[0].courses[0].title,
      };
      await user.saveFavoriteCourses(user.favoriteCourses.length ? [
        ...user.favoriteCourses,
        temp,
      ] : [temp]);
    }
  };

  useLayoutEffect(() => {
    if (containerRef.current.clientHeight > window.innerHeight * 0.5) {
      console.log(containerRef.current.clientHeight);
      console.log(window.innerHeight);
      setShowMore(false);
    }
  }, []);

  if (!loading) {
    return (
      <div className="course-card" ref={containerRef}>
        <div className="course-card-title-container">
          <p className="title">{courseId}</p>
          <IconButton aria-label="cart" components="span" size="medium">
            <ShoppingCart />
          </IconButton>
          <IconButton className={isFavorited ? 'active' : ''} onClick={() => setFavorited()} aria-label="favourite" components="span" size="medium">
            <Favorite />
          </IconButton>
        </div>
        <p className="caption">{courseInfo.subjects[0].courses[0].title}</p>
        <div className="course-badge-row">
          {
            [
              [`${parseInt(courseInfo.subjects[0].courses[0].units, 10)} Credits`],
              [courseInfo.subjects[0].courses[0].academic_group],
              ...(Array.isArray(courseInfo.subjects[0].courses[0].components) ? courseInfo.subjects[0].courses[0].components : (courseInfo.subjects[0].courses[0].components || '').match(/[A-Z][a-z]+/g)).map(item => [item]),
              ...(courseInfo.subjects[0].courses[0].assessments || []).map(assessment => [assessment.name, parseInt(assessment.percentage, 10) || false]),
            ].map(([k, v], i) => <Badge index={i} text={k} value={v} key={k + v} />)
          }
        </div>
        <p className="caption description">{courseInfo.subjects[0].courses[0].description}</p>
        <ShowMoreOverlay
          visible={!showMore}
          onShowMore={() => setShowMore(true)}
        />
        {
          showMore
          && ['outcome', 'syllabus', 'required_readings', 'recommended_readings']
            .filter(key => courseInfo.subjects[0].courses[0][key] && courseInfo.subjects[0].courses[0][key] !== '') // filter off empty strings
            .map(key => (
              <div key={key}>
                <p className="sub-heading">{key.replace('_', ' ')}</p>
                <p className="caption">{courseInfo.subjects[0].courses[0][key]}</p>
              </div>
            ))
        }
      </div>
    );
  }
  return <Loading />;
};

export default observer(CourseCard);
