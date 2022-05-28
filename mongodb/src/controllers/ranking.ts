import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import Course from '../models/course.model';
import Ranking from '../models/ranking.model';
import { RANK_LIMIT } from '../constant/configs';
import { RankEntry } from 'cutopia-types/lib/types';

const rankingCache = new NodeCache({
  stdTTL: 600,
});

const rankField = (field: string) => [
  {
    $project: {
      val:
        field === 'numReviews'
          ? '$rating.numReviews'
          : {
              $divide: [`$rating.${field}`, '$rating.numReviews'],
            },
    },
  },
  {
    $sort: {
      val: -1,
    },
  },
  {
    $limit: RANK_LIMIT,
  },
];

export const rankCourses = async () => {
  const result = await Course.aggregate([
    {
      $facet: {
        numReviews: rankField('numReviews'),
        grading: rankField('grading'),
        content: rankField('content'),
        difficulty: rankField('difficulty'),
        teaching: rankField('teaching'),
        overall: rankField('overall'),
      } as any,
    },
    // $facet does not support $merge in nested pipeline and seems
    // splitting one document into multiples with different fields is not feasible ($unwind does not help)
    // so we have to separate the write operations from aggregate
  ]).exec();
  const bulkOperations = Object.keys(result[0]).map(field => ({
    updateOne: {
      filter: { _id: field },
      update: {
        _id: field,
        ranks: result[0][field],
      },
      upsert: true,
    },
  }));
  await Ranking.bulkWrite(bulkOperations);
};

export const getRanking = async (field: string) =>
  withCache(rankingCache, field, async () => await Ranking.findById(field));

type UpdateRankingProps = {
  field: string;
  rank: RankEntry;
  limit?: number;
};

export const updateRanking = async (input: UpdateRankingProps) => {
  Ranking.findByIdAndUpdate(input.field, {
    $push: {
      ranks: {
        $each: [input.rank], // TODO: need check nested _id instead of this
        $slice: -(input.limit || RANK_LIMIT),
      },
    },
  });
};
