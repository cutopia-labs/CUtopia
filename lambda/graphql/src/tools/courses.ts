import fs from 'fs';

import { Course } from 'cutopia-types/lib/types';

const courses: Record<string, Course> = {};

const courseFolder = `${__dirname}/../data`;

fs.readdirSync(`${courseFolder}/courses`).forEach(subjectFileName => {
  const courseList: Course[] = JSON.parse(
    fs.readFileSync(`${courseFolder}/courses/${subjectFileName}`).toString()
  );
  if (courseList.length !== 0) {
    const subjectName = subjectFileName.split('.')[0];
    courseList.forEach(course => {
      const courseId = `${subjectName}${course.code}`;
      courses[courseId] = {
        ...course,
        courseId,
      };
    });
  }
});

export { courses };
