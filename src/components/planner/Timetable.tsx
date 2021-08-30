import { useContext } from 'react';
import { useMediaQuery } from '@material-ui/core';

import './Timetable.scss';
import colors from '../../constants/colors';
import { WEEKDAYS } from '../../constants';
import {
  CourseTableEntry,
  Event,
  EventConfig,
  TimetableInfo,
} from '../../types';
import { ViewContext } from '../../store';
import CourseCard from './CourseCard';

export type PropsWithConfig<T> = T & {
  config: EventConfig;
};

const TimetableTicks = ({ config }: PropsWithConfig<{}>) => {
  return (
    <>
      {Array.from(
        { length: config.endHour - config.startHour + 1 },
        (_, i) => config.startHour + i
      ).map(hour => (
        <div className="time-line-box" key={`Timeline:${hour}`}>
          {hour !== config.startHour
            ? `${hour > 9 ? '' + hour : '0' + hour}:00`
            : ''}
        </div>
      ))}
    </>
  );
};

type WeekdayTextProps = {
  withDate?: boolean;
  timetableInfo?: TimetableInfo;
};

const WeekdayText = ({
  withDate,
  config,
  timetableInfo,
}: PropsWithConfig<WeekdayTextProps>) => {
  const currentDay = new Date();
  const currentWeekday = currentDay.getDay() ? currentDay.getDay() : 7;

  return (
    <>
      {Array.from({ length: config.numOfDays }, (_, i) => 1 + i).map(day => {
        const differenceOfDate = day - currentWeekday;
        const thatDay = new Date();
        thatDay.setDate(new Date().getDate() + differenceOfDate);
        return (
          <div className="weekday-cell" key={`weekday-${day}`}>
            <span className="weekday-text column center">
              {`${WEEKDAYS[day - 1]}${withDate ? ` ${thatDay.getDate()}` : ''}`}
              <span className="caption">
                {`(${timetableInfo?.weekdayAverageHour[day] || 0} hrs)`}
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
};

type TimetableProps = {
  courses: CourseTableEntry[];
  timetableInfo: TimetableInfo;
};

const Timetable = ({ courses, timetableInfo }: TimetableProps) => {
  const view = useContext(ViewContext);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const events: Event[] = [];
  const config: EventConfig = {
    startHour: 8,
    endHour: 18,
    numOfDays: 5,
    numOfHours: 12,
  };
  let colorIndex = 0;

  try {
    courses
      .filter(course => course)
      .forEach((course, i) => {
        Object.entries(course.sections).forEach(([k, v]) => {
          (v.days || []).forEach((day, i) => {
            if (!v.hide) {
              const startHour = parseInt(v.startTimes[i].split(':')[0], 10);
              const endHour = parseInt(v.endTimes[i].split(':')[0], 10);
              if (startHour < config.startHour) {
                config.startHour = startHour;
              }
              if (endHour > config.endHour) {
                config.endHour = endHour;
              }
              if (day > config.numOfDays) {
                config.numOfDays = day;
              }
              events.push({
                courseId: course.courseId,
                title: course.title,
                section: k,
                day: day,
                startTime: v.startTimes[i],
                endTime: v.endTimes[i],
                location: v.locations[i],
                color:
                  colors.timetableColors[
                    colorIndex % colors.randomColorsLength
                  ],
              });
            }
          });
        });
        colorIndex++;
      });
    config.numOfHours = config.endHour - config.startHour + 1;
    console.log(config);
  } catch (error) {
    console.log(error);
    view.setSnackBar({
      message: 'Invalid Timetable',
      severity: 'warning',
    });
  }

  console.log(config);

  return (
    <div className="timetable-container">
      <div className="weekday-row">
        <WeekdayText config={config} timetableInfo={timetableInfo} />
      </div>
      <div className="timetable-canvas">
        <div className="timetable-ticks">
          <TimetableTicks config={config} />
        </div>
        <div className="timetable-courses-container">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width={`${100 / config.numOfDays}%`}
                height={`${100 / config.numOfHours}%`}
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
          {events.map((event, i) => (
            <CourseCard
              key={`${event.courseId}-${i}-${event.day}`}
              course={event}
              config={config}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
