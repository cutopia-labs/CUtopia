import NodeCache from 'node-cache';
import Course from '../models/course.model';
import withCache from '../utils/withCache';

const courseCache = new NodeCache({
  stdTTL: 600,
});

export const getCourseData = async input =>
  withCache(courseCache, input.courseId, async () => {
    return await Course.findById(input.courseId);
  });

export type Review = {
  _id: string;
  courseId: string;
  username: string;
  anonymous: boolean;
  title?: string;
  createdAt: number;
  updatedAt: number;
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

export const updateCourseData = async (
  courseId: string,
  review: Review,
  oldReview?: Review // update course data from existing review if any
) => {
  const ratingInc = {
    'rating.numReviews': 1,
    'rating.overall': review.overall,
    'rating.grading': review.grading.grade,
    'rating.content': review.content.grade,
    'rating.difficulty': review.difficulty.grade,
    'rating.teaching': review.teaching.grade,
  };
  if (oldReview) {
    const critierions = ['grading', 'content', 'difficulty', 'teaching'];
    critierions.forEach(
      critierion =>
        (ratingInc[`rating.${critierion}`] -= oldReview[critierion].grade)
    );
    ratingInc['rating.numReviews'] = 0;
    ratingInc['rating.overall'] -= oldReview.overall;
  }

  return await Course.findByIdAndUpdate(
    courseId,
    {
      $addToSet: {
        lecturers: review.lecturer,
        terms: review.term,
      },
      $inc: ratingInc,
    },
    {
      new: true,
      upsert: true,
    }
  );
};
