import { CourseRating } from 'cutopia-types/lib/types';

const processRating = (rating: CourseRating) => ({
  ...rating,
  overall: rating.overall / rating.numReviews,
  grading: rating.grading / rating.numReviews,
  content: rating.content / rating.numReviews,
  teaching: rating.teaching / rating.numReviews,
  difficulty: rating.difficulty / rating.numReviews,
});

export default processRating;
