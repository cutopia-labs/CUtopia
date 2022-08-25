import { getCourseData } from 'mongodb';

import { Resolvers } from '../schemas/types';
import { courses } from '../tools/courses';

const coursesResolver: Resolvers = {
  Query: {
    course: async (parent, { filter }) => {
      const { requiredCourse, requiredTerm } = filter;
      const {
        lecturers: reviewLecturers,
        terms: reviewTerms,
        rating,
      } = (await getCourseData({ courseId: requiredCourse })) || {};
      return {
        ...courses[requiredCourse],
        courseId: requiredCourse,
        sections: requiredTerm
          ? courses[requiredCourse]['terms'][requiredTerm]
          : null,
        reviewLecturers,
        reviewTerms,
        rating,
      };
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
  },
};

export default coursesResolver;
