import { SERVER_ADDR, SIMILAR_COURSE_LIMIT } from '../constants/configs';
import UserStore from '../store/UserStore';
import { CourseConcise, CourseSearchItem, SearchPayload } from '../types';
import { UGE_COURSE_CODES } from '../constants';
import { getStoreData, storeData } from './store';
import { generateRandomArray, getSubjectAndCode } from '.';

const SUBJECT_RULE = new RegExp('[a-zA-Z]{4}');
const CODE_RULE = new RegExp('\\d{4}$');
const CODE_RULE_ALTER = new RegExp('\\d+', 'g');
const CONDENSED_RULE = new RegExp('[^a-zA-Z0-9]', 'g');

export const fetchCourses = async (): Promise<
  Record<string, CourseSearchItem[]> | undefined
> => {
  let courseList: Record<string, CourseSearchItem[]> | undefined =
    getStoreData('courseList')?.data;
  if (!courseList) {
    const res = await fetch(`${SERVER_ADDR}/static/course_list.json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    courseList = await res.json();
    storeData('courseList', {
      data: courseList,
      etag: +new Date(),
    });
  }
  return courseList;
};

export const getCoursesFromQuery = async ({
  payload,
  user,
  limit,
  offerredOnly,
}: {
  payload: SearchPayload;
  user?: UserStore;
  limit?: number;
  offerredOnly?: boolean;
}): Promise<CourseSearchItem[] | false> => {
  try {
    const courseList = await fetchCourses();
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

export const getSimilarCourses = async (
  courseId: string,
  limit: number = SIMILAR_COURSE_LIMIT,
  courseTitle?: string
): Promise<CourseConcise[]> => {
  const occurred = new Set();
  let results = [];
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

export const getRandomGeCourses = async (
  limit: number = SIMILAR_COURSE_LIMIT
): Promise<CourseConcise[]> => {
  const courses = await fetchCourses();
  const GECourses = UGE_COURSE_CODES.map(subject => courses[subject])
    .flat()
    .filter(course => course.o);
  const GECoursesLen = GECourses.length;
  return [...generateRandomArray(limit, GECoursesLen)].map(index => ({
    courseId: GECourses[index].c,
    title: GECourses[index].t,
  }));
};
