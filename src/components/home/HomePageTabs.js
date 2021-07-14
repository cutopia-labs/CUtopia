import React from 'react';
import { Link } from 'react-router-dom';

import './HomePageTabs.css';
import ListItem from '../ListItem';
import Loading from '../Loading';
import { getMMMDDYY } from '../../helpers/getTime';

const CoursesList = ({ loading, courses }) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      <div className="home-course-container card">
        {courses?.map((course) => (
          <Link key={course.courseId} to={`/review/${course.courseId}`}>
            <ListItem
              className="search-list-item column home-course-list-item"
              label={course.courseId}
              caption={course.title}
              noBorder
            />
          </Link>
        ))}
      </div>
    )}
  </>
);

const ReviewsList = ({ loading, reviewIds }) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      <div className="home-course-container card">
        {reviewIds?.map((id) => {
          const [courseId, createdDate] = id.split('#');
          return (
            <Link key={id} to={`/review/${courseId}/${createdDate}`}>
              <ListItem
                className="search-list-item column home-course-list-item"
                label={courseId}
                caption={getMMMDDYY(createdDate)}
                noBorder
              />
            </Link>
          );
        })}
      </div>
    )}
  </>
);

export { CoursesList, ReviewsList };
