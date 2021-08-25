/* eslint-disable camelcase */ // course_sections is not in camelcase when parsing the data
import { getCourseData } from 'mongodb';

import { courses } from '../data/courses';
import processRating from '../utils/processRating';

const subjectsResolver = {
  Query: {
    courses: (parent, { filter }) => {
      const { requiredCourses = [], requiredTerm = null } = { ...filter };
      const idsContext = {
        courseCode: null,
        term: null,
        section: null,
        requiredTerm,
      };
      return requiredCourses.map(id => ({
        idsContext,
        course: courses[id],
      }));
    },
  },
  Course: {
    courseId: ({ course }) => course.courseId,
    title: ({ course }) => course.title,
    reviewLecturers: async ({ idsContext, course }) => {
      const result = await getCourseData({ courseId: course.courseId });
      return result?.lecturers || [];
    },
    reviewTerms: async ({ idsContext, course }) => {
      const result = await getCourseData({ courseId: course.courseId });
      return result?.terms || [];
    },
    career: ({ course }) => course.career,
    units: ({ course }) => course.units,
    grading: ({ course }) => course.grading,
    components: ({ course }) => course.components,
    campus: ({ course }) => course.campus,
    academic_group: ({ course }) => course.academic_group,
    requirements: ({ course }) => course.requirements,
    description: ({ course }) => course.description,
    outcome: ({ course }) => course.outcome,
    syllabus: ({ course }) => course.syllabus,
    required_readings: ({ course }) => course.required_readings,
    recommended_readings: ({ course }) => course.recommended_readings,
    terms: ({ idsContext, course }) => {
      const { code, terms } = course;
      const { requiredTerm } = idsContext;
      if (!requiredTerm || !terms) {
        return null;
      }
      return [
        {
          idsContext: {
            ...idsContext,
            courseCode: code,
            term: requiredTerm,
          },
          course_sections: terms[requiredTerm],
        },
      ];
    },
    assessments: ({ course }) => {
      const { assessments } = course;
      if (assessments === undefined) {
        return null;
      }
      return Object.keys(assessments).map(assessment => ({
        name: assessment,
        percentage: assessments[assessment],
      }));
    },
    rating: async ({ course }) => {
      const result = await getCourseData({ courseId: course.courseId });
      return result ? processRating(result.rating) : null;
    },
  },
  Term: {
    name: ({ idsContext }) => idsContext.term,
    course_sections: ({ idsContext, course_sections }) => {
      if (!course_sections) {
        return null;
      }
      const sectionsNames = Object.keys(course_sections);
      return sectionsNames.map(section => ({
        idsContext: {
          ...idsContext,
          section,
        },
        ...course_sections[section],
      }));
    },
  },
  CourseSection: {
    name: ({ idsContext, name }) => {
      // when idsContext is undefined, the course section name is derived from database
      return idsContext === undefined ? name : idsContext.section;
    },
  },
  AssessementComponent: {},
};

export default subjectsResolver;
