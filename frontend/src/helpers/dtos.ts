import { PlannerCourse } from 'cutopia-types';

export const coursesToEntries = (courses: PlannerCourse[], skipHide = false) =>
  courses
    .filter(
      course =>
        course && course.sections && Object.values(course.sections)?.length
    )
    .map(course => {
      let sections = Object.values(course?.sections || {});
      sections = skipHide
        ? sections.filter(section => section && !section.hide)
        : sections;
      return {
        ...course,
        sections: sections.map(section => {
          /* Remove the hide attr if not hidden */
          const { hide, ...copy } = section;
          if (hide) {
            (copy as any).hide = true;
          }
          return copy;
        }),
      };
    });

export const entriesToCourses = (entries: any[]) =>
  entries.map(course => ({
    ...course,
    sections: Object.fromEntries(
      course.sections.map(section => {
        const sectionCopy = {
          ...section,
          hide: section.hide || false, // Must set to false, otherwise will sync twice!!!
        };
        return [section.name, sectionCopy];
      })
    ),
  })) || [];
