import { SIMILAR_COURSE_LIMIT } from '../constants/configs';
import { fetchCourses } from './getCoursesFromQuery';
import { getSubjectAndCode } from './';

const getSimilarCourses = async (
  courseId: string,
  limit: number = SIMILAR_COURSE_LIMIT,
  courseTitle?: string
) => {
  const occurred = new Set();
  const results = [];
  const { subject, code } = getSubjectAndCode(courseId);
  console.log(code);
  const codeLevel = code.charAt(0);
  const courseList = await fetchCourses();
  let currLen = 0;
  for (let i = 0; i < courseList[subject].length && currLen < limit; i++) {
    if (
      courseList[subject][i].c.charAt(4) === codeLevel &&
      courseList[subject][i].c !== courseId
    ) {
      occurred.add(courseList[subject][i].c);
      results.push({
        courseId: courseList[subject][i].c,
        title: courseList[subject][i].t,
      });
      currLen++;
    }
  }
  if (currLen < limit) {
    results
      .concat(courseList[subject].slice(0, limit - currLen))
      .filter((course) => !occurred.has(course.courseId));
  }
  return results;
};

export default getSimilarCourses;
