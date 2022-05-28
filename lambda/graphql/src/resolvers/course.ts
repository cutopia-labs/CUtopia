import { getCourseData } from 'mongodb';

import { Resolvers } from '../schemas/types';

const coursesResolver: Resolvers = {
  Query: {
    courses: (parent, { filter }) => {
      const { requiredCourses } = filter;
      return requiredCourses.map(async courseId => {
        const {
          lecturers: reviewLecturers,
          terms: reviewTerms,
          rating,
        } = (await getCourseData({ courseId })) || {};
        return {
          courseId,
          reviewLecturers,
          reviewTerms,
          rating,
        };
      });
    },
  },
  Course: {
    rating: async ({ rating }) => {
      if (!rating) {
        return null;
      }
      return {
        numReviews: rating.numReviews,
        overall: rating.overall / rating.numReviews,
        grading: rating.grading / rating.numReviews,
        content: rating.content / rating.numReviews,
        teaching: rating.teaching / rating.numReviews,
        difficulty: rating.difficulty / rating.numReviews,
      };
    },
  },
};

export default coursesResolver;
