import NodeCache from 'node-cache';
import Course from '../models/course.model';

const courseCache = new NodeCache({
  stdTTL: 1800,
});

export const getCourseData = async input => {
  const { courseId } = input;

  const courseData = courseCache.get(courseId);
  if (courseData) {
    return courseData;
  }

  const result = await Course.findById(courseId);
  courseCache.set(courseId, result);

  return result;
};

export const updateCourseDataFromReview = async (courseId, reviewData) => {
  await Course.findByIdAndUpdate(
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
    },
    e => {
      if (e) {
        console.trace(e);
      }
    }
  );
};
