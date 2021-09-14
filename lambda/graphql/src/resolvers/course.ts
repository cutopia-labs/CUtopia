import { getCourseData } from 'mongodb';
import { verifyCourseId } from '../utils';

import { courses } from '../data/courses';
import processRating from '../utils/processRating';
import {
  AssessementComponentResolvers,
  CourseResolvers,
  CourseSectionResolvers,
  QueryResolvers,
  TermResolvers,
} from '../schemas/types';

export const coursesPreResolver = {
  courses: [
    ['reviewLecturers', 'reviewTerms', 'rating'],
    async parent => {
      const { lecturers, terms, rating } = await getCourseData({
        courseId: parent.course.courseId,
      });
      return {
        reviewLecturers: lecturers,
        reviewTerms: terms,
        rating,
      };
    },
  ],
};

// TODO: add { requiredTerm } in `parent` type in resolvers
type CourseResolver = {
  Query: any;
  Course: any;
  Term: TermResolvers;
  CourseSection: CourseSectionResolvers;
  AssessementComponent: AssessementComponentResolvers;
};

const coursesResolver: CourseResolver = {
  Query: {
    courses: (parent, { filter }) => {
      const { requiredCourses = [], requiredTerm = null } = { ...filter };
      /* TODO: NOT SURE ADD OR NOT FOR PERFORMANCE
      requiredCourses.forEach(id => {
        verifyCourseId(id);
      });
      */
      return requiredCourses.map(code => ({
        requiredTerm,
        ...courses[code],
      }));
    },
  },
  Course: {
    terms: ({ requiredTerm, terms }) => {
      if (!requiredTerm || !terms) {
        return null;
      }
      return [
        {
          name: requiredTerm,
          course_sections: terms[requiredTerm],
        },
      ];
    },
    assessments: ({ assessments }) => {
      if (!assessments) {
        return null;
      }
      const assessmentsNames = Object.keys(assessments);
      return assessmentsNames.map(name => ({
        name,
        percentage: assessments[name],
      }));
    },
    rating: async ({ rating }) => (rating ? processRating(rating) : null),
  },
  Term: {
    course_sections: ({ course_sections }) => {
      if (!course_sections) {
        return null;
      }
      const sectionsNames = Object.keys(course_sections);
      return sectionsNames.map(name => ({
        name,
        ...course_sections[name],
      }));
    },
  },
  CourseSection: {},
  AssessementComponent: {},
};

export default coursesResolver;
