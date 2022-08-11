import { SIMILAR_COURSE_LIMIT } from '../config';
import {
  CourseConcise,
  CourseQuery,
  CourseSearchList,
  LecturerQuery,
} from '../types';
import {
  INSTRUCTOR_PREFIXS,
  INSTRUCTOR_PREFIXS_LEN,
  UGE_COURSE_CODES,
} from '../constants';
import { generateRandomArray, getSubjectAndCode } from '.';

const SUBJECT_RULE = new RegExp('[a-zA-Z]{4}');
const CODE_RULE = new RegExp('\\d{4}$');
const CODE_RULE_ALTER = new RegExp('\\d+', 'g');
const CONDENSED_RULE = new RegExp('[^a-zA-Z0-9]', 'g');

export const _searchCourses = (
  courseList: CourseSearchList,
  query: CourseQuery
) => {
  try {
    const { payload, user, limit, offerredOnly } = query;
    if (!courseList) {
      throw new Error('Cannot fetch courses!');
    }
    // load local Timetable
    const { mode, text } = payload;
    switch (mode) {
      case 'Pins':
        return user.favoriteCourses.map(course => ({
          c: course.courseId,
          t: course.title,
          o: 1, // TEMP: cuz search for avalibiltity is tedious, so set as offered for all
        }));
      case 'subject':
        return courseList[text];
      case 'query':
        const condensed = text.replace(CONDENSED_RULE, '');
        try {
          // valid search contains suject and code
          const subject = condensed.match(SUBJECT_RULE)[0].toUpperCase();
          const rawCode =
            condensed.match(CODE_RULE) || condensed.match(CODE_RULE_ALTER);
          const code = rawCode ? rawCode[0] : null;
          if (!(subject in courseList)) {
            throw 'Wrong subject, searching for title';
          }
          if (subject && code) {
            const results = [];
            for (
              let i = 0;
              i < courseList[subject].length && results.length < limit;
              i++
            ) {
              if (
                courseList[subject][i].c.includes(code) &&
                (!offerredOnly || courseList[subject][i].o)
              ) {
                if (code.length === 4) {
                  return [courseList[subject][i]].slice(0, limit);
                }
                results.push(courseList[subject][i]);
              }
            }
            return results;
          }
          if (subject) {
            return courseList[subject];
          }
        } catch (error) {
          // search for courseId & titles
          const results = [];
          const queryString = text.toLowerCase().trim();
          for (const [, courses] of Object.entries(courseList)) {
            for (let i = 0; i < courses.length && results.length < limit; i++) {
              if (
                (courses[i].c.toLowerCase().includes(queryString) ||
                  courses[i].t.toLowerCase().includes(queryString)) &&
                (!offerredOnly || courses[i].o)
              ) {
                results.push(courses[i]);
              }
            }
          }
          return results;
        }
        return [];
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
};

export const _getSimilarCourses = (
  courseList: CourseSearchList,
  courseId: string,
  limit: number = SIMILAR_COURSE_LIMIT
): CourseConcise[] => {
  const occurred = new Set();
  let results = [];
  const { subject, code } = getSubjectAndCode(courseId);

  const codeLevel = code.charAt(0);
  let currLen = 0;
  for (let i = 0; i < courseList[subject].length && currLen < limit; i++) {
    if (
      courseList[subject][i].c.charAt(4) === codeLevel &&
      courseList[subject][i].c !== courseId
    ) {
      occurred.add(courseList[subject][i].c);
      results.push(courseList[subject][i]);
      currLen++;
    }
  }
  if (currLen < limit) {
    results = results.concat(
      courseList[subject]
        .slice(0, limit - currLen)
        .filter(course => !occurred.has(course.c))
    );
  }
  return results.map(course => ({
    courseId: course.c,
    title: course.t,
  }));
};

export const _getRandomGeCourses = (
  courses: CourseSearchList,
  limit: number = SIMILAR_COURSE_LIMIT
): CourseConcise[] => {
  const GECourses = UGE_COURSE_CODES.map(subject => courses[subject])
    .flat()
    .filter(course => course.o);
  const GECoursesLen = GECourses.length;
  return [...generateRandomArray(limit, GECoursesLen)].map(index => ({
    courseId: GECourses[index].c,
    title: GECourses[index].t,
  }));
};

/* Instructors */

const removePrefix = (
  str: string,
  prefix: Array<string> = INSTRUCTOR_PREFIXS
) => {
  for (let i = 0; i < INSTRUCTOR_PREFIXS_LEN; i++) {
    if (str.startsWith(prefix[i])) {
      return str.slice(prefix[i].length);
    }
  }
  return str;
};

export const _searchLecturers = async (
  instructors: string[],
  query: LecturerQuery
): Promise<string[] | false> => {
  try {
    const { payload, limit } = query;
    const results = [];
    let resultsLen = 0;
    const instructorsLen = instructors.length;
    // preprocess str
    const searchStr = removePrefix(payload.toLowerCase())
      .replace('.', '')
      .trim();
    for (let i = 0; i <= instructorsLen && resultsLen <= limit; i++) {
      if ((instructors[i] || '').toLowerCase().includes(searchStr)) {
        results.push(instructors[i]);
        resultsLen++;
      }
    }
    return results;
  } catch (e) {
    return [];
  }
};
