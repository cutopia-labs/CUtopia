import { subjects } from '../../data/courses';
import NodeCache from 'node-cache';
import { getRanking } from 'mongodb';
import withCache from '../../utils/withCache';

const rankingCache = new NodeCache({
  stdTTL: 1800,
  useClones: false,
});

export const getCourseById = courseId => {
  const subjectName = courseId.slice(0, 4);
  const courseCode = courseId.slice(4, 8);
  const courses = subjects[subjectName];
  return courses.find(course => course.code === courseCode);
};

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
