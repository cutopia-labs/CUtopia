import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import RankingModel, { Ranking } from '../models/ranking.model';

const rankingCache = new NodeCache({
  stdTTL: 1800,
});

export const createRanking = async (input: Partial<Ranking>) => {
  const { _id, ...rankingBody } = input;
  await RankingModel.findByIdAndUpdate(
    _id,
    {
      ...rankingBody,
      createdAt: +new Date(),
    },
    {
      new: true,
      upsert: true,
    }
  );
};

export const getRanking = async (rankingId: string) =>
  withCache(
    rankingCache,
    rankingId,
    async () => await RankingModel.findById(rankingId)
  );
