import { getCourse as getCourseDataFromDB } from 'mongodb';
import NodeCache from 'node-cache';

import { Context } from '../context';
import { Resolvers } from '../schemas/types';
import { getCatalogManifest } from '../utils/catalog';
import { requireDatabase } from '../utils/database';
import { getCourse as getCourseDataFromJSON } from '../utils/getCourse';
import withCache from '../utils/withCache';

const courseCache = new NodeCache({ stdTTL: 600 });
const reviewCache = new NodeCache({ stdTTL: 600 });

const courseReviews = (courseId: string, context: Context) => {
  context.courseReviews ||= new Map();
  if (!context.courseReviews.has(courseId)) {
    const pending = withCache(reviewCache, courseId, async () => {
      await requireDatabase();
      const data = await getCourseDataFromDB(courseId);
      return {
        rating: data?.rating,
        lecturers: data?.lecturers,
        terms: data?.terms,
      };
    }).catch(() => {
      console.warn(JSON.stringify({ event: 'course_reviews_unavailable' }));
      return null;
    });
    context.courseReviews.set(courseId, pending);
  }
  return context.courseReviews.get(courseId);
};

const coursesResolver: Resolvers = {
  Query: {
    course: async (parent, { filter }, context) => {
      const { requiredCourse, requiredTerm } = filter;
      const manifest = context?.catalog || (await getCatalogManifest());
      return withCache(
        courseCache,
        `${manifest?.version || 'local'}#${requiredCourse}#${requiredTerm}`,
        async () => {
          const courseData = await getCourseDataFromJSON(
            requiredCourse,
            manifest
          );
          return {
            ...courseData,
            courseId: requiredCourse,
            sections: requiredTerm ? courseData['terms']?.[requiredTerm] : null,
          };
        }
      );
    },
  },
  Course: {
    reviewLecturers: async ({ courseId }, _, context) =>
      (await courseReviews(courseId, context))?.lecturers,
    reviewTerms: async ({ courseId }, _, context) =>
      (await courseReviews(courseId, context))?.terms,
    rating: async ({ courseId, rating: suppliedRating }, _, context) => {
      const rating =
        suppliedRating || (await courseReviews(courseId, context))?.rating;
      if (!rating?.numReviews) {
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
