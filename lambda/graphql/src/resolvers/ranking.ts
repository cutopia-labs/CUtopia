import { getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import { Resolvers } from '../schemas/types';
import { getCourse } from '../utils/getCourse';
import withCache from '../utils/withCache';

const rankingCache = new NodeCache({ stdTTL: 600 });

const rankingResolver: Resolvers = {
  Query: {
    ranking: () => ({}),
  },
  RankTable: {
    rankedCourses: async (parent, { filter: { rankBy } }) =>
      withCache(rankingCache, rankBy, async () => {
        const { ranks } = await getRanking(rankBy);
        return ranks?.map(({ _id, val }) => ({
          courseId: _id,
          course: getCourse(_id),
          [rankBy]: val,
        }));
      }),
  },
};

export default rankingResolver;
