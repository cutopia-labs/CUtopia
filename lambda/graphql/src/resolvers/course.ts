import { getCourseData } from 'mongodb';
import NodeCache from 'node-cache';

import { Resolvers } from '../schemas/types';
import { courses } from '../tools/courses';
import withCache from '../utils/withCache';

const courseCache = new NodeCache({ stdTTL: 600 });

const coursesResolver: Resolvers = {
  Query: {
    course: async (parent, { filter }) => {
      const { requiredCourse, requiredTerm } = filter;
      return withCache(
        courseCache,
        `${requiredCourse}#${requiredTerm}`,
        async () => {
          const { lecturers, terms, rating } =
            (await getCourseData(requiredCourse)) || {};
          return {
            ...courses[requiredCourse],
            courseId: requiredCourse,
            sections: requiredTerm
              ? courses[requiredCourse]['terms'][requiredTerm]
              : null,
            reviewLecturers: lecturers,
            reviewTerms: terms,
            rating,
          };
        }
      );
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
