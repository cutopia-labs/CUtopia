import { getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import { Resolvers } from '../schemas/types';
import { courses } from '../tools/courses';
import withCache from '../utils/withCache';

const rankingCache = new NodeCache({
  stdTTL: 600,
  useClones: false,
});

export const getRankingWithCache = async (field: string) =>
  withCache(rankingCache, field, async () => {
    const result = await getRanking(field);
    const resData = result.ranks?.map(rank => {
      const courseId = rank._id;
      return {
        courseId,
        course: courses[courseId],
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
