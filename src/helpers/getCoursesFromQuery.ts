import UserStore from '../store/UserStore';
import { CourseSearchItem, SearchPayload } from '../types';
import { getStoreData, storeData } from './store';

const SUBJECT_RULE = new RegExp('[a-zA-Z]{4}');
const CODE_RULE = new RegExp('\\d{4}$');
const CODE_RULE_ALTER = new RegExp('\\d+', 'g');
const CONDENSED_RULE = new RegExp('[^a-zA-Z0-9]', 'g');

const getCoursesFromQuery = async ({
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
    let courseList: Record<string, CourseSearchItem[]> | undefined =
      getStoreData('course_list')?.data;
    if (!courseList) {
      const res = await fetch(
        'https://pv9wmcullh.execute-api.ap-northeast-1.amazonaws.com/Stage/static/course_list.json',
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            Accept: 'application/json',
          },
        }
      );
      courseList = await res.json();
      storeData('course_list', {
        data: courseList,
        etag: +new Date(),
      });
    }
    // load local TimeTable
    const { mode, text } = payload;
    switch (mode) {
      case 'Pins':
        return user.favoriteCourses.map((course) => ({
          c: course.courseId,
          t: course.title,
        }));
      case 'My Courses':
        return user.timetable?.map((course) => ({
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
          // search for titles
          const results = [];
          const queryString = text.toLowerCase().trim();
          for (const [, courses] of Object.entries(courseList)) {
            for (let i = 0; i < courses.length && results.length < limit; i++) {
              if (
                courses[i].t.toLowerCase().includes(queryString) &&
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

export default getCoursesFromQuery;
