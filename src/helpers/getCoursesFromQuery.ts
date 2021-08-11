import COURSES from '../constants/courses';
import UserStore from '../store/UserStore';
import { CourseSearchItem, SearchPayload } from '../types';

const SUBJECT_RULE = new RegExp('[a-zA-Z]{4}');
const CODE_RULE = new RegExp('\\d{4}$');
const CODE_RULE_ALTER = new RegExp('\\d+', 'g');
const CONDENSED_RULE = new RegExp('[^a-zA-Z0-9]', 'g');

const getCoursesFromQuery = ({
  payload,
  user,
  limit,
  offerredOnly,
}: {
  payload: SearchPayload;
  user?: UserStore;
  limit?: number;
  offerredOnly?: boolean;
}): CourseSearchItem[] => {
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
      return COURSES[text];
    case 'query':
      const condensed = text.replace(CONDENSED_RULE, '');
      try {
        // valid search contains suject and code
        const subject = condensed.match(SUBJECT_RULE)[0].toUpperCase();
        const rawCode =
          condensed.match(CODE_RULE) || condensed.match(CODE_RULE_ALTER);
        const code = rawCode ? rawCode[0] : null;
        if (!(subject in COURSES)) {
          throw 'Wrong subject, searching for title';
        }
        if (subject && code) {
          const results = [];
          for (
            let i = 0;
            i < COURSES[subject].length && results.length < limit;
            i++
          ) {
            if (
              COURSES[subject][i].c.includes(code) &&
              (!offerredOnly || COURSES[subject][i].o)
            ) {
              if (code.length === 4) {
                return [COURSES[subject][i]].slice(0, limit);
              }
              results.push(COURSES[subject][i]);
            }
          }
          return results;
        }
        if (subject) {
          return COURSES[subject];
        }
      } catch (error) {
        // search for titles
        const results = [];
        const queryString = text.toLowerCase().trim();
        for (const [, courses] of Object.entries(COURSES)) {
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
      return null;
  }
};

export default getCoursesFromQuery;
