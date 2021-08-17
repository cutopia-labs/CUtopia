import { courses } from '../../data/courses';
import NodeCache from 'node-cache';
import { getRanking } from 'mongodb';
import withCache from '../../utils/withCache';

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
