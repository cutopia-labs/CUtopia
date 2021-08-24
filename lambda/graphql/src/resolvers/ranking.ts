import { getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import { courses } from '../data/courses';
import withCache from '../utils/withCache';

const rankingCache = new NodeCache({
  stdTTL: 1800,
  useClones: false,
});

export const getCourseById = courseId => courses[courseId];

export const getRankingWithCache = async (field: string) =>
  withCache(rankingCache, `${field}-ranking`, async () => {
    const result = await getRanking(field);
    const resData = result?.ranks?.map(rank => ({
      courseId: rank._id,
      course: {
        course: getCourseById(rank._id),
      },
      [field]: rank.val,
    }));
    return resData;
  });

const rankingResolver = {
  Query: {
    ranking: () => ({}),
  },
  RankTable: {
    popularCourses: async (parent, { filter }) => {
      return await getRankingWithCache('numReviews');
    },
    topRatedCourses: async (parent, { filter }) => {
      const { limit, sortBy } = filter;
      return (await getRankingWithCache(sortBy))?.slice(0, limit);
    },
  },
};

export default rankingResolver;
