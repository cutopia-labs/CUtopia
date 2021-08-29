export type Grade = 'F' | 'D' | 'C' | 'B' | 'A';

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

export type ReviewsResult = {
  reviews: {
    reviews: Review[];
    lastEvaluatedKey?: LastEvaluatedKey;
  };
};

export type LastEvaluatedKey = {
  courseId: string;
  createdAt: string;
  upvotes?: number;
};

export type CreateReviewResult = {
  id?: string;
  createdAt?: string;
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
