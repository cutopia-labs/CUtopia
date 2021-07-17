import React from 'react';
import { useMediaQuery } from '@material-ui/core';

import './CourseList.css';
import CourseCard from './CourseCard';
import colors from '../../constants/colors';
import { WEEKDAYS } from '../../constants/states';
import { TIMETABLE_CONSTANTS } from '../../constants/configs';
import { CourseTableEntry } from '../../types';

const { NO_OF_DAYS, NO_OF_HOURS, START_HOUR, END_HOUR } = TIMETABLE_CONSTANTS;

const TimeTableTicks = () => {
  const startHour = START_HOUR;
  const endHour = END_HOUR;
  return (
    <>
      {Array.from(
        { length: endHour - startHour + 1 },
        (_, i) => startHour + i
      ).map((hour) => (
        <div className="time-line-box" key={`Timeline:${hour}`}>
          {hour !== startHour ? `${hour > 9 ? '' + hour : '0' + hour}:00` : ''}
        </div>
      ))}
    </>
  );
};

type WeekdayTextProps = {
  withDate?: boolean;
};

const WeekdayText = ({ withDate }: WeekdayTextProps) => {
  const currentDay = new Date();
  const currentWeekday = currentDay.getDay() ? currentDay.getDay() : 7;

  return (
    <>
      {Array.from({ length: NO_OF_DAYS }, (_, i) => 1 + i).map((day) => {
        const differenceOfDate = day - currentWeekday;
        const thatDay = new Date();
        thatDay.setDate(new Date().getDate() + differenceOfDate);
        return (
          <div className="weekday-cell" key={`weekday-${day}`}>
            <span className="weekday-text">
              {`${WEEKDAYS[day - 1]}${withDate ? ` ${thatDay.getDate()}` : ''}`}
            </span>
          </div>
        );
      })}
    </>
  );
};

type CourseListProps = {
  courses: CourseTableEntry[];
};

export default function CourseList({ courses }: CourseListProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const courseViews = [];
  let colorIndex = 0;
  let earlistGrid = NO_OF_HOURS; // Auto vertical scroll to earlistGrid
  let weekendCourse = false;

  try {
    courses.forEach((course) => {
      Object.entries(course.sections).forEach(([k, v]) => {
        (v.days || []).forEach((day, i) => {
          const sTime = v.startTimes[i].split(':');
          const timeGrid =
            parseInt(sTime[0], 10) + parseInt(sTime[1], 10) / 60 - 8;
          if (timeGrid < earlistGrid) {
            earlistGrid = timeGrid;
          }
          if (day > 5) {
            weekendCourse = true;
          }
          courseViews.push(
            <CourseCard
              key={`${course.courseId}-${k}-${day}`}
              course={{
                courseId: course.courseId,
                title: course.title,
                section: k,
                day,
                startTime: v.startTimes[i],
                endTime: v.endTimes[i],
                location: v.locations[i],
                color:
                  colors.randomColors[colorIndex % colors.randomColors.length],
              }}
            />
          );
        });
      });
      colorIndex++;
    });
  } catch (error) {
    console.warn('Invalid TimeTable');
  }

  return (
    <div className="timetable-container">
      <div className="weekday-row">
        <WeekdayText />
      </div>
      <div className="timetable-canvas">
        <div className="timetable-ticks">
          <TimeTableTicks />
        </div>
        <div className="timetable-courses-container">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width={`${100 / NO_OF_DAYS}%`}
                height={`${100 / NO_OF_HOURS}%`}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 300 1 L 1 1 1 300"
                  fill="none"
                  stroke={
                    prefersDarkMode
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.1)'
                  }
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {courseViews}
        </div>
      </div>
    </div>
  );
}
