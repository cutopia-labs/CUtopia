import { getRanking, rankCourses } from 'mongodb';
import { getRankingWithCache } from './impl';

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
