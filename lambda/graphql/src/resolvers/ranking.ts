import { getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import { courses } from '../data/courses';
import withCache from '../utils/withCache';
import { Resolvers } from '../schemas/types';

const rankingCache = new NodeCache({
  stdTTL: 600,
  useClones: false,
});

export const getCourseById = courseId => courses[courseId];

export const getRankingWithCache = async (field: string) =>
  withCache(rankingCache, `${field}-ranking`, async () => {
    const result = await getRanking(field);
    // Remark: "sections" field in Course is null when querying with "rankedCourses"
    // and it is not used when showing the ranked courses
    const resData = result?.ranks?.map(rank => ({
      courseId: rank._id,
      course: getCourseById(rank._id),
      [field]: rank.val,
    }));
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
