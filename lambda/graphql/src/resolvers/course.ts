import { getCourseData } from 'mongodb';
import { verifyCourseId } from '../utils';

import { courses } from '../data/courses';
import processRating from '../utils/processRating';
import { Resolvers } from '../schemas/types';

export const coursesPreResolver = {
  courses: [
    ['reviewLecturers', 'reviewTerms', 'rating'],
    async ({ courseId }) => {
      const { lecturers, terms, rating } =
        (await getCourseData({ courseId })) || {};
      return {
        reviewLecturers: lecturers,
        reviewTerms: terms,
        rating,
      };
    },
  ],
};

const coursesResolver: Resolvers = {
  Query: {
    courses: (parent, { filter }) => {
      const { requiredCourses = [], requiredTerm = null } = { ...filter };
      /* TODO: NOT SURE ADD OR NOT FOR PERFORMANCE
      requiredCourses.forEach(id => {
        verifyCourseId(id);
      });
      */
      return requiredCourses.map(code => ({
        sections: courses[code]['terms'][requiredTerm],
        ...courses[code],
      }));
    },
  },
  Course: {
    sections: ({ sections }) => {
      if (!sections) {
        return null;
      }
      const sectionsNames = Object.keys(sections);
      return sectionsNames.map(name => ({
        name,
        ...sections[name],
      }));
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
  CourseSection: {},
  AssessementComponent: {},
};

export default coursesResolver;
