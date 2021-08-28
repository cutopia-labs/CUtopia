import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import Course from '../models/course.model';
import Ranking from '../models/ranking.model';
import { RANK_LIMIT } from '../constant/configs';

const rankingCache = new NodeCache({
  stdTTL: 1800,
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
      },
    },
    // $facet does not support $merge in nested pipeline and seems
    // splitting one document into multiples with different fields is not feasible ($unwind does not help)
    // so we have to separate the write operations from aggregate
  ]);
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
