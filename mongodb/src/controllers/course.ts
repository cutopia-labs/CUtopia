import NodeCache from 'node-cache';
import { rankCoursesPipeline } from '../pipelines/review';
import Course from '../models/course.model';
import { createRanking } from './ranking';
import { RankEntry, Ranking } from '../models/ranking.model';
import withCache from '../utils/withCache';

const courseCache = new NodeCache({
  stdTTL: 1800,
});

export const getCourseData = async input =>
  withCache(courseCache, input.courseId, async () => {
    return await Course.findById(input.courseId);
  });

export type Review = {
  id: string;
  courseId: string;
  username: string;
  anonymous: boolean;
  title?: string;
  createdAt: string;
  modifiedDate: string;
  term: string;
  lecturer: string;
  overall: number;
  grading: ReviewDetails;
  teaching: ReviewDetails;
  difficulty: ReviewDetails;
  content: ReviewDetails;
  upvotes: number;
  downvotes: number;
  myVote?: number;
};

export type ReviewDetails = {
  grade: number;
  text: string;
};

export const updateCourseDataFromReview = async (
  courseId: string,
  reviewData: Review
) =>
  Course.findByIdAndUpdate(
    courseId,
    {
      $addToSet: {
        lecturers: reviewData.lecturer,
        terms: reviewData.term,
      },
      $inc: {
        'rating.numReviews': 1,
        'rating.overall': reviewData.overall,
        'rating.grading': reviewData.grading.grade,
        'rating.content': reviewData.content.grade,
        'rating.difficulty': reviewData.difficulty.grade,
        'rating.teaching': reviewData.teaching.grade,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

export const rankCourses = async (field, limit, filter) => {
  const result: RankEntry[] = await Course.aggregate(
    rankCoursesPipeline(field, limit, filter)
  );
  if (result?.length) {
    await createRanking({
      _id: field,
      ranks: result,
    });
  } else {
    //TODO THROW ERROR
  }
  return result;
};
