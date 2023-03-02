import { useMediaQuery } from '@mui/material';

import clsx from 'clsx';
import { FC, forwardRef } from 'react';
import styles from '../../styles/components/planner/Timetable.module.scss';
import { WEEKDAYS } from '../../constants';
import { EventConfig, PlannerCourse, TimetableInfo } from '../../types';
import { useView } from '../../store';
import { courses2events } from '../../helpers/timetable';
import CourseCard from './CourseCard';

export type PropsWithConfig<T = {}> = T & {
  config: EventConfig;
};

const TimetableTicks: FC<PropsWithConfig> = ({ config }) => {
  return (
    <>
      {Array.from(
        { length: config.endHour - config.startHour + 1 },
        (_, i) => config.startHour + i
      ).map(hour => (
        <div className={styles.timeLineBox} key={`Timeline:${hour}`}>
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

const WeekdayText: FC<PropsWithConfig<WeekdayTextProps>> = ({
  withDate,
  config,
  timetableInfo,
}) => {
  const currentDay = new Date();
  const currentWeekday = currentDay.getDay() ? currentDay.getDay() : 7;

  return (
    <>
      {Array.from({ length: config.numOfDays }, (_, i) => 1 + i).map(day => {
        const differenceOfDate = day - currentWeekday;
        const thatDay = new Date();
        thatDay.setDate(new Date().getDate() + differenceOfDate);
        return (
          <div key={`weekday-${day}`}>
            <span className={clsx(styles.weekdayText, 'column center')}>
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
  courses: PlannerCourse[];
  timetableInfo: TimetableInfo;
};

const Timetable = forwardRef<HTMLDivElement, TimetableProps>(
  ({ courses, timetableInfo }, ref) => {
    const view = useView();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [events, config] = courses2events(courses);
    if (events === null) view.warn('Invalid Timetable');

    return (
      <div
        ref={ref}
        className={clsx(styles.timetableContainer, 'timetable-container')}
      >
        <div className={styles.weekdayRow}>
          <WeekdayText config={config} timetableInfo={timetableInfo} />
        </div>
        <div className={styles.timetableCanvas}>
          <div className={styles.timetableTicks}>
            <TimetableTicks config={config} />
          </div>
          <div className={styles.timetableCoursesContainer}>
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
            {(events || []).map((event, i) => (
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
  }
);

Timetable.displayName = 'Timetable';

export default Timetable;
