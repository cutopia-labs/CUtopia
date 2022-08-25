import fs from 'fs';
import { Course } from 'cutopia-types/lib/types';
import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();

export interface CourseExtended extends Course {
  courseId: string;
}

const ignoredFiles = new Set(['.DS_Store']);

const courses: Record<string, CourseExtended> = {};

const dirname = `${process.cwd()}/../data/courses`;

const subjectFilenames = fs.readdirSync(dirname);

console.log(`Loading ${subjectFilenames.length} subjects in ${dirname}`);

subjectFilenames.forEach(subjectFileName => {
  if (ignoredFiles.has(subjectFileName)) return;
  const filepath = fs.readFileSync(`${dirname}/${subjectFileName}`).toString();
  const courseList: Course[] = JSON.parse(filepath);
  if (courseList.length !== 0) {
    const subjectName = subjectFileName.split('.')[0];
    courseList
      .filter(course => course)
      .forEach(course => {
        const courseId = `${subjectName}${course.code}`;
        const assessmentsNames = Object.keys(course?.assessments || {});
        courses[courseId] = {
          ...course,
          assessments: assessmentsNames.map(name => ({
            name,
            percentage: course.assessments[name],
          })),
          courseId,
        };
      });
  }
});

export { courses };
