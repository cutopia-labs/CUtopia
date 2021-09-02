import { useContext } from 'react';
import { IconButton, useTheme } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import './CourseCard.scss';
import updateOpacity from '../../helpers/updateOpacity';
import { PlannerContext } from '../../store';
import { Event } from '../../types';
import colorMixing from '../../helpers/colorMixing';
import { PropsWithConfig } from './Timetable';

const useStyles = (
  durationHeight: string,
  topMarginValue: string,
  bgColor: string,
  textColor: string,
  day: number,
  numOfDays: number
) => ({
  courseCard: {
    width: `calc(${99 / numOfDays}% - 12px)`,
    marginLeft: `${(100 / numOfDays) * (day - 1)}%`,
    height: durationHeight,
    minHeight: durationHeight, // For the use of hover height: fit-content
    top: topMarginValue,
    backgroundColor: bgColor,
  },
  courseCardTitle: {
    color: textColor,
  },
  courseCardLocation: {
    color: textColor,
  },
});

const CourseCard = ({
  course,
  config,
}: PropsWithConfig<{
  course: Event;
}>) => {
  const theme = useTheme();
  const sTime = course.startTime.split(':');
  const eTime = course.endTime.split(':');
  const topMarginValue = `${
    (+sTime[0] - config.startHour + +sTime[1] / 60.0) *
    (100 / config.numOfHours)
  }%`;
  const durationHeight = `${
    (100 / config.numOfHours) *
    (+eTime[0] - +sTime[0] + (+eTime[1] - +sTime[1]) / 60.0)
  }%`;
  const bgColor = colorMixing(
    updateOpacity(course.color, 0.15),
    theme.palette.background.paper
  );
  const textColor = updateOpacity(course.color, 0.8);
  const styles = useStyles(
    durationHeight,
    topMarginValue,
    bgColor,
    textColor,
    course.day,
    config.numOfDays
  );
  const planner = useContext(PlannerContext);

  return (
    <div className="timetable-course-card" style={styles.courseCard}>
      <span
        className="timetable-course-card-title"
        style={styles.courseCardTitle}
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
          planner.deleteSectionInPlannerCourses({
            courseId: course.courseId,
            sectionId: course.section,
          })
        }
      >
        <Delete />
      </IconButton>
    </div>
  );
};

export default observer(CourseCard);
