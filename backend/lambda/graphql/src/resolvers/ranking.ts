import { getRanking } from 'mongodb';
import NodeCache from 'node-cache';

import { Resolvers } from '../schemas/types';
import { getCatalogManifest } from '../utils/catalog';
import { requireDatabase } from '../utils/database';
import { getCourse } from '../utils/getCourse';
import withCache from '../utils/withCache';

const rankingCache = new NodeCache({ stdTTL: 600 });
const PUBLIC_RANKING_FIELDS = new Set([
  'numReviews',
  'grading',
  'content',
  'difficulty',
  'teaching',
  'overall',
]);

const rankingResolver: Resolvers = {
  Query: {
    ranking: () => ({}),
  },
  RankTable: {
    rankedCourses: async (parent, { filter: { rankBy } }, context) => {
      if (!PUBLIC_RANKING_FIELDS.has(rankBy)) {
        return [];
      }
      const catalog = await getCatalogManifest(context?.catalogVersion);
      return withCache(
        rankingCache,
        `${catalog?.version || 'local'}#${rankBy}`,
        async () => {
          await requireDatabase();
          const { ranks } = await getRanking(rankBy);
          return Promise.all(
            (ranks || []).map(async ({ _id, val }) => ({
              courseId: _id,
              course: await getCourse(_id, catalog),
              [rankBy]: val,
            }))
          );
        }
      );
    },
  },
};

export default rankingResolver;
