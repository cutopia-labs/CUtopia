import React from 'react';
import { Link } from 'react-router-dom';
import { School } from '@material-ui/icons';

import './MyCourseList.css';
import MyListItem from '../ListItem';
import Loading from '../Loading';

const MyCourseList = ({ loading, courses }) => (
  <div className="course-card">
    <div className="course-card-header center-row">
      <School />
      <span className="course-card-header-title">My Courses</span>
    </div>
    {
      loading ? (
        <Loading />
      ) : (
        <div className="course-container">
          {courses.map(course => (
            <Link
              key={course.courseId}
              to={`/review/${course.courseId}`}
            >
              <MyListItem>
                <div className="search-list-item column">
                  <span className="title">{course.courseId}</span>
                  <span className="caption">{course.title}</span>
                </div>
              </MyListItem>
            </Link>
          ))}
        </div>
      )
    }
  </div>
);

export default MyCourseList;
