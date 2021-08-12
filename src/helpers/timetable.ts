import { CourseSection } from '../types';

export const getDurationInHour = (section: CourseSection, i: number) => {
  const sTime = section.startTimes[i].split(':');
  const eTime = section.endTimes[i].split(':');
  console.log(sTime);
  console.log(eTime);
  console.log(+eTime[0] - +sTime[0] + (+eTime[1] - +sTime[1]) / 60.0);
  return +eTime[0] - +sTime[0] + (+eTime[1] - +sTime[1]) / 60.0;
};
