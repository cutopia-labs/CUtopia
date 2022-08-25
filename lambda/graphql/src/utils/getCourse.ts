import fs from 'fs';

import { Course } from 'cutopia-types/lib/types';

const courses: Record<string, Course> = {};
const courseFolder = `${__dirname}/../data/courses`;

const getCourse = (courseId: string): Course => {
  if (!(courseId in courses)) {
    const subjectName = courseId.slice(0, 4);
    const courseList: Course[] = JSON.parse(
      fs.readFileSync(`${courseFolder}/${subjectName}.json`).toString()
    );
    if (courseList.length !== 0) {
      courseList.forEach(course => {
        const courseId = `${subjectName}${course.code}`;
        courses[courseId] = {
          ...course,
          courseId,
        };
      });
    }
  }
  return courses[courseId];
};

export { getCourse };
