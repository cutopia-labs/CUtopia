import React, { useState, useRef } from 'react';
import { useMediaQuery } from '@material-ui/core';

import './CourseList.css';
import CourseCard from './CourseCard';
import colors from '../../constants/colors';
import { TIMETABLE_CONSTANTS, WEEKDAYS } from '../../constants/states';
import updateOpacity from '../../helpers/updateOpacity';

const {
  CELL_WIDTH, NO_OF_DAYS, NO_OF_HOURS, LEFT_BAR_WIDTH,
} = TIMETABLE_CONSTANTS;

const TimeTableTicks = () => {
  const startHour = 8;
  const endHour = 19;
  const timeLineViews = [];

  for (let i = startHour; i <= endHour; i++) {
    const hourString = i > 9 ? `${i}` : `0${i}`;
    timeLineViews.push(
      <div className="time-line-box" key={`Timeline:${hourString}`}>
        <span className="time-line-text">{`${hourString}:00`}</span>
      </div>,
    );
  }
  return timeLineViews;
};

const WeekdayText = ({ withDate }) => {
  const returnView = [];
  const currentDay = new Date();
  const currentWeekday = currentDay.getDay() ? currentDay.getDay() : 7;

  for (let i = 1; i <= NO_OF_DAYS; i++) {
    const differenceOfDate = i - currentWeekday;
    const thatDay = new Date();
    thatDay.setDate(new Date().getDate() + differenceOfDate);
    returnView.push(
      <div className="weekday-cell" key={`weekday-${i}`}>
        <span className="weekday-text">
          {`${WEEKDAYS[i - 1]}${withDate ? ` ${thatDay.getDate()}` : ''}`}
        </span>
      </div>,
    );
  }
  return returnView;
};

export default function CourseList({ courses }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const courseViews = [];
  let colorIndex = 0;
  let earlistGrid = NO_OF_HOURS; // Auto vertical scroll to earlistGrid
  let weekendCourse = false;

  try {
    courses.forEach(course => {
      Object.entries(course.sections).forEach(([k, v]) => {
        (v.days || []).forEach((day, i) => {
          const sTime = v.startTimes[i].split(':');
          const timeGrid = parseInt(sTime[0], 10) + parseInt(sTime[1], 10) / 60 - 8;
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
                color: colors.randomColors[colorIndex % colors.randomColors.length],
              }}
            />,
          );
        });
      });
      colorIndex++;
    });
  }
  catch (error) {
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
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
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
                  stroke={prefersDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
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
