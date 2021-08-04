import { getSectionTime } from '../components/forum/CourseSections';
import { CourseSection } from '../types';

const timeStrToInt = (timeStr: string) =>
  parseInt(timeStr?.replace(':', ''), 10);

const timeInRange = (s1: CourseSection, s2: CourseSection): string | null => {
  for (let i = 0; i < s1.days.length; i++) {
    for (let j = 0; j < s2.days.length; j++) {
      // check if time range overlap if in sameday
      if (s1.days[i] === s2.days[j]) {
        const s1StartTime = timeStrToInt(s1.startTimes[i]);
        const s1EndTime = timeStrToInt(s1.endTimes[i]);
        const s2StartTime = timeStrToInt(s2.startTimes[j]);
        const s2EndTime = timeStrToInt(s2.endTimes[j]);
        if (s1StartTime < s2EndTime && s1EndTime > s2StartTime) {
          console.log(s1);
          console.log(s2);
          return getSectionTime(s2);
        }
      }
    }
  }
  return null;
};

export default timeInRange;
