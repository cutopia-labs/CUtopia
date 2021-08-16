import NodeCache from 'node-cache';
import { rankCoursesPipeline } from '../pipelines/review';
import Course from '../models/course.model';

const courseCache = new NodeCache({
  stdTTL: 1800,
});

export const getCourseData = async input => {
  const { courseId } = input;

  const courseData = JSON.parse(courseCache.get(courseId) || 'null');
  if (courseData) {
    console.log(courseData);
    return courseData;
  }

  const result = await Course.findById(courseId);
  courseCache.set(courseId, JSON.stringify(result));

  return result;
};

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
  const result = await Course.aggregate(
    rankCoursesPipeline(field, limit, filter)
  );
  return result;
};
