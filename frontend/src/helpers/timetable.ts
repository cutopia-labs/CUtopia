import { getSectionTime } from '../components/review/CourseSections';
import { DEFAULT_EVENT_CONFIG } from '../config';
import { CourseSection, Event, EventConfig, PlannerCourse } from '../types';
import colors from '../constants/colors';
import ICS, { formatIcsDate, IcsEvent } from './ics';

export const getDurationInHour = (section: CourseSection, i: number) => {
  const sTime = section.startTimes[i].split(':');
  const eTime = section.endTimes[i].split(':');
  return +eTime[0] - +sTime[0] + (+eTime[1] - +sTime[1]) / 60.0;
};

const timeStrToInt = (timeStr: string) =>
  parseInt(timeStr?.replace(':', ''), 10);

export const timeInRange = (
  s1: CourseSection,
  s2: CourseSection
): string | null => {
  for (let i = 0; i < s1.days.length; i++) {
    for (let j = 0; j < s2.days.length; j++) {
      // check if time range overlap if in sameday
      if (s1.days[i] === s2.days[j]) {
        const s1StartTime = timeStrToInt(s1.startTimes[i]);
        const s1EndTime = timeStrToInt(s1.endTimes[i]);
        const s2StartTime = timeStrToInt(s2.startTimes[j]);
        const s2EndTime = timeStrToInt(s2.endTimes[j]);
        if (s1StartTime < s2EndTime && s1EndTime > s2StartTime) {
          return getSectionTime(s2);
        }
      }
    }
  }
  return null;
};

export const courses2events = (
  courses: PlannerCourse[]
): [Event[] | null, EventConfig] => {
  const events: Event[] = [];
  const config: EventConfig = DEFAULT_EVENT_CONFIG;
  try {
    courses
      .filter(course => course)
      .forEach((course, courseIndex) => {
        Object.entries(course.sections).forEach(([k, v]) => {
          if (v.hide) return;
          (v.days || []).forEach((day, i) => {
            const startHour = parseInt(v.startTimes[i].split(':')[0], 10);
            const endHour = parseInt(v.endTimes[i].split(':')[0], 10);
            day = parseInt(day as any, 10);
            if (
              Number.isNaN(startHour) ||
              Number.isNaN(endHour) ||
              Number.isNaN(day)
            )
              return;
            if (startHour < config.startHour) {
              config.startHour = startHour;
            }
            if (endHour > config.endHour) {
              config.endHour = endHour;
            }
            /* If sunday course */
            if (day === 0) {
              day = 7;
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
                colors.timetableColors[courseIndex % colors.randomColorsLength],
            });
          });
        });
      });
    config.numOfHours = config.endHour - config.startHour + 1;
    return [events, config];
  } catch (error) {
    return [null, config];
  }
};

/**
 * Convert CUtopia course to iCal format
 * - Each section join corresponding meeting dates to
 * @param course
 * @returns IcsEvents
 */
const course2ics = (course: PlannerCourse): IcsEvent[] => {
  const currentYear = new Date().getFullYear(); // assume all courses are within the same year (CUHK has no winter semester)
  const events: IcsEvent[] = [];
  Object.entries(course.sections).forEach(([sectionName, section]) => {
    // skip hidden or section without meetingDates (OLD VERSION)
    if (section.hide || !section.meetingDates?.length) return;
    // event with basic info
    const baseEvent: Partial<IcsEvent> = {
      title: `${course.courseId} ${sectionName}`,
    };
    section.days.forEach((day, i) => {
      const sTime = section.startTimes[i];
      const eTime = section.endTimes[i];
      section.meetingDates.forEach(date => {
        /** match day to date & format start time/end time to UNIX timestamp */
        // convert dd/mm to a Date obj
        const parts = date.split('/');
        if (parts.length !== 2) return;
        const sDate = new Date(
          `${parts[1]}-${parts[0]}-${currentYear} ${sTime}`
        );
        const eDate = new Date(
          `${parts[1]}-${parts[0]}-${currentYear} ${eTime}`
        );
        const dayOfDate = sDate.getDay();
        if (dayOfDate !== +day) return; // skip not matching date
        const event: IcsEvent = {
          ...baseEvent,
          startTime: formatIcsDate(sDate),
          endTime: formatIcsDate(eDate),
          location: section.locations[i],
        };
        events.push(event);
      });
    });
  });
  return events;
};

/**
 * Convert CUtopia timetable to iCal format
 * @param courses
 */
export const timetable2ics = (courses: PlannerCourse[]): ICS => {
  const ics = new ICS();
  courses.forEach(course => {
    ics.addEvents(course2ics(course));
  });
  return ics;
};
