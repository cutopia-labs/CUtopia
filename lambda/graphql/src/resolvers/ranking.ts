import { getCourseData, getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import withCache from '../utils/withCache';
import { Resolvers } from '../schemas/types';

const rankingCache = new NodeCache({
  stdTTL: 600,
  useClones: false,
});

export const getRankingWithCache = async (field: string) =>
  withCache(rankingCache, `${field}-ranking`, async () => {
    const result = await getRanking(field);
    const resData = result?.ranks?.map(async rank => {
      const courseId = rank._id;
      const {
        lecturers: reviewLecturers,
        terms: reviewTerms,
        rating,
      } = (await getCourseData({ courseId })) || {};
      return {
        courseId,
        course: {
          courseId,
          reviewLecturers,
          reviewTerms,
          rating,
        },
        [field]: rank.val,
      };
    });
    return resData;
  });

const rankingResolver: Resolvers = {
  Query: {
    ranking: () => ({}),
  },
  RankTable: {
    rankedCourses: async (parent, { filter }) => {
      const { rankBy } = filter;
      return await getRankingWithCache(rankBy);
    },
  },
};

export default rankingResolver;
