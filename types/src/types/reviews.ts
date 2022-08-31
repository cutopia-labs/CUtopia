export type Grade = 'F' | 'D' | 'C' | 'B' | 'A';

export type RatingField = 'grading' | 'content' | 'difficulty' | 'teaching';

export type RatingFieldWithOverall =
  | 'overall'
  | 'grading'
  | 'content'
  | 'difficulty'
  | 'teaching';

export type RecentReview = {
  id: string;
  courseId: string;
  username: string;
  title?: string;
  createdAt: string;
  overall: number;
  grading: ReviewDetails;
};

export type Review = {
  _id: string;
  username: string;
  reviewId: string;
  title: string;
  courseId: string;
  term: string;
  lecturer: string;
  anonymous: boolean;
  upvotes: number;
  downvotes: number;
  upvoteUserIds: string[];
  downvoteUserIds: string[];
  overall: number;
  grading: ReviewDetails;
  teaching: ReviewDetails;
  difficulty: ReviewDetails;
  content: ReviewDetails;
  createdAt: number;
  updatedAt: number;
};

export type ReviewDetails = {
  grade: number;
  text: string;
};

export type ReviewsResult = {
  reviews: Review[];
  nextPage?: number;
};

export type LastEvaluatedKey = {
  courseId: string;
  createdAt: string;
  upvotes?: number;
};

export type CreateReviewResult = {
  createdAt?: string;
};

export type ReviewsFilter = {
  courseId: string;
  sortBy?: string;
  page?: number;
  lecturer?: string;
  term?: string;
  ascending?: boolean;
};
