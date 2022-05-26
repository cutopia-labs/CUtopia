import { getCourseData } from 'mongodb';

import processRating from '../utils/processRating';
import { Resolvers } from '../schemas/types';

const coursesResolver: Resolvers = {
  Query: {
    courses: (parent, { filter }) => {
      const { requiredCourses = [] } = { ...filter };
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
    rating: async ({ rating }) => (rating ? processRating(rating) : null),
  },
};

export default coursesResolver;
