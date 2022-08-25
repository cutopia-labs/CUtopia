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
  createdDate: string;
  overall: number;
  grading: ReviewDetail;
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
  grading: ReviewDetail;
  teaching: ReviewDetail;
  difficulty: ReviewDetail;
  content: ReviewDetail;
  createdAt: number;
  updatedAt: number;
};

export type ReviewDetail = {
  grade: number;
  text: string;
};

export type ReviewsResult = {
  reviews: {
    reviews: Review[];
    lastEvaluatedKey?: LastEvaluatedKey;
  };
};

export type LastEvaluatedKey = {
  courseId: string;
  createdDate: string;
  upvotes?: number;
};

export type CreateReviewResult = {
  id?: string;
  createdDate?: string;
  error?: string;
};

export type VoteReviewResult = {
  review?: Review;
  error?: string;
};

export type ReviewsFilter = {
  courseId: string;
  getLatest?: boolean;
  ascendingDate?: boolean;
  ascendingVote?: boolean;
  lastEvaluatedKey?: LastEvaluatedKey;
  lecturer?: string;
};
