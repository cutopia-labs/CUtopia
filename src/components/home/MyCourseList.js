import React from 'react';
import { Link } from 'react-router-dom';
import { School } from '@material-ui/icons';

import './MyCourseList.css';
import ListItem from '../ListItem';
import Loading from '../Loading';

const MyCourseList = ({ loading, courses }) => (
  <div className="home-course-card">
    <div className="home-course-card-header center-row">
      <School />
      <span className="home-course-card-header-title">My Courses</span>
    </div>
    {
      loading ? (
        <Loading />
      ) : (
        <div className="home-course-container">
          {courses?.map(course => (
            <Link
              key={course.courseId}
              to={`/review/${course.courseId}`}
            >
              <ListItem>
                <div className="search-list-item column">
                  <span className="title">{course.courseId}</span>
                  <span className="caption">{course.title}</span>
                </div>
              </ListItem>
            </Link>
          ))}
        </div>
      )
    }
  </div>
);

export default MyCourseList;
