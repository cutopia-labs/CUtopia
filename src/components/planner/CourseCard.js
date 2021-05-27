import { makeStyles } from '@material-ui/styles';
import React, { create } from 'react';

import { TIMETABLE_CONSTANTS } from '../../constants/states';
import updateOpacity from '../../helpers/updateOpacity';

const {
  CELL_WIDTH, CELL_HEIGHT, START_HOUR, NO_OF_DAYS, NO_OF_HOURS,
} = TIMETABLE_CONSTANTS;

const useStyles = (durationHeight, topMarginValue, bgColor, textColor, day) => ({
  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    borderRadius: 4,
    zIndex: 2,
    width: `${99 / NO_OF_DAYS}%`,
    marginLeft: `${(100 / NO_OF_DAYS) * (day - 1)}%`,
    height: durationHeight,
    top: topMarginValue,
    backgroundColor: 'var(--background)',
  },
  innerCard: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    borderRadius: 4,
    padding: '4px 6px',
    backgroundColor: bgColor,
  },
  courseCardTitle: {
    display: 'flex',
    fontSize: 12,
    fontWeight: 'bold',
    color: textColor,
    textAlign: 'initial',
  },
  courseCardLocation: {
    marginTop: 2,
    fontSize: 10,
    color: textColor,
  },
});

export default function CourseCard({ course, backgroundColor, onClick }) {
  console.log(`${course.courseId} ${course.section}`);

  const sTime = course.startTime.split(':');
  const eTime = course.endTime.split(':');
  const topMarginValue = `${(sTime[0] - START_HOUR + (sTime[1] / 60.0)) * (100 / NO_OF_HOURS)}%`;
  const durationHeight = `${(100 / NO_OF_HOURS) * (eTime[0] - sTime[0] + (eTime[1] - sTime[1]) / 60.0)}%`;
  const bgColor = updateOpacity(course.color, 0.15);
  const textColor = updateOpacity(course.color, 0.8);

  const classes = useStyles(durationHeight, topMarginValue, bgColor, textColor, course.day);

  return (
    <div
      activeOpacity={0.7}
      style={classes.courseCard}
      onClick={onClick}
    >
      <div style={classes.innerCard}>
        <span style={classes.courseCardTitle} numberOfLines={2} ellipsizeMode="clip">
          {`${course.courseId} ${course.section}`}
        </span>
      </div>
    </div>
  );
}
