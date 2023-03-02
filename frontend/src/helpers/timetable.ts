import { getSectionTime } from '../components/review/CourseSections';
import { DEFAULT_EVENT_CONFIG } from '../config';
import { CourseSection, CourseTableEntry, Event, EventConfig } from '../types';
import colors from '../constants/colors';

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
  courses: CourseTableEntry[]
): [Event[] | null, EventConfig] => {
  const events: Event[] = [];
  const config: EventConfig = DEFAULT_EVENT_CONFIG;
  try {
    courses
      .filter(course => course)
      .forEach((course, courseIndex) => {
        Object.entries(course.sections).forEach(([k, v]) => {
          (v.days || []).forEach((day, i) => {
            if (!v.hide) {
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
                  colors.timetableColors[
                    courseIndex % colors.randomColorsLength
                  ],
              });
            }
          });
        });
      });
    config.numOfHours = config.endHour - config.startHour + 1;
    return [events, config];
  } catch (error) {
    return [null, config];
  }
};
