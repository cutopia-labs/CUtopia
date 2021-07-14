import React, { useContext } from 'react';
import { IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import './CourseCard.css';
import { TIMETABLE_CONSTANTS } from '../../constants/configs';
import updateOpacity from '../../helpers/updateOpacity';
import { UserContext } from '../../store';

const { START_HOUR, NO_OF_DAYS, NO_OF_HOURS } = TIMETABLE_CONSTANTS;

const useStyles = (
  durationHeight,
  topMarginValue,
  bgColor,
  textColor,
  day
) => ({
  courseCard: {
    width: `${99 / NO_OF_DAYS}%`,
    marginLeft: `${(100 / NO_OF_DAYS) * (day - 1)}%`,
    height: durationHeight,
    minHeight: durationHeight, // For the use of hover height: fit-content
    top: topMarginValue,
  },
  innerCard: {
    backgroundColor: bgColor,
  },
  courseCardTitle: {
    color: textColor,
  },
  courseCardLocation: {
    color: textColor,
  },
});

const CourseCard = ({ course }) => {
  console.log(`${course.courseId} ${course.section}`);

  const sTime = course.startTime.split(':');
  const eTime = course.endTime.split(':');
  const topMarginValue = `${
    (sTime[0] - START_HOUR + sTime[1] / 60.0) * (100 / NO_OF_HOURS)
  }%`;
  const durationHeight = `${
    (100 / NO_OF_HOURS) * (eTime[0] - sTime[0] + (eTime[1] - sTime[1]) / 60.0)
  }%`;
  const bgColor = updateOpacity(course.color, 0.15);
  const textColor = updateOpacity(course.color, 0.8);
  const styles = useStyles(
    durationHeight,
    topMarginValue,
    bgColor,
    textColor,
    course.day
  );
  const user = useContext(UserContext);

  return (
    <div
      activeOpacity={0.7}
      className="timetable-course-card"
      style={styles.courseCard}
    >
      <div className="timetable-inner-card" style={styles.innerCard}>
        <span
          className="timetable-course-card-title"
          style={styles.courseCardTitle}
          numberOfLines={2}
          ellipsizeMode="clip"
        >
          {`${course.courseId} ${course.section}`}
        </span>
        <span
          className="timetable-course-card-location"
          style={styles.courseCardLocation}
        >
          {course.location}
        </span>
        <IconButton
          size="small"
          color="primary"
          className="timetable-course-card-delete"
          style={{
            color: textColor,
          }}
          onClick={() =>
            user.deleteSectionInPlannerCourses({
              courseId: course.courseId,
              sectionId: course.section,
            })
          }
        >
          <Delete />
        </IconButton>
      </div>
    </div>
  );
};

export default observer(CourseCard);
