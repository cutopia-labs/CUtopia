import NodeCache from 'node-cache';
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

export const getRanking = async (rankingId: string) => {
  const rankingData = JSON.parse(rankingCache.get(rankingId) || 'null');
  if (rankingData) {
    return rankingData;
  }
  const result = await RankingModel.findById(rankingId);
  rankingCache.set(rankingId, JSON.stringify(result));
  return result;
};
