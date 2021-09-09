import {
  RECENT_REVIEWS_CONTENT_QUERY,
  RECENT_REVIEWS_DIFFICULTY_QUERY,
  RECENT_REVIEWS_GRADING_QUERY,
  RECENT_REVIEWS_TEACHING_QUERY,
} from '../constants/queries';
import { RatingField } from '../types';

const RECENT_REVIEWS_MAPPING = {
  content: RECENT_REVIEWS_CONTENT_QUERY,
  grading: RECENT_REVIEWS_GRADING_QUERY,
  teaching: RECENT_REVIEWS_TEACHING_QUERY,
  difficulty: RECENT_REVIEWS_DIFFICULTY_QUERY,
};

export const getRecentReviewQuery = (category: RatingField) =>
  RECENT_REVIEWS_MAPPING[category];
