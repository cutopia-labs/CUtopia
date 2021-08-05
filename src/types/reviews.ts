type Grade = 'F' | 'D' | 'C' | 'B' | 'A';

type Review = {
  id: string;
  courseId: string;
  username: string;
  anonymous: boolean;
  title?: string;
  createdDate: string;
  modifiedDate: string;
  term: string;
  section: string;
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

type ReviewDetails = {
  grade: number;
  text: string;
};

type ReviewsResult = {
  reviews: {
    reviews: Review[];
    lastEvaluatedKey?: LastEvaluatedKey;
  };
};

type LastEvaluatedKey = {
  courseId: string;
  createdDate: string;
  upvotes?: number;
};

type CreateReviewResult = {
  id?: string;
  createdDate?: string;
  error?: string;
};

type VoteReviewResult = {
  review?: Review;
  error?: string;
};

type ReviewsFilter = {
  courseId: string;
  getLatest?: boolean;
  ascendingDate?: boolean;
  ascendingVote?: boolean;
  lastEvaluatedKey?: LastEvaluatedKey;
  lecturer?: string;
};

export type {
  Grade,
  Review,
  ReviewDetails,
  ReviewsResult,
  ReviewsFilter,
  LastEvaluatedKey,
  CreateReviewResult,
  VoteReviewResult,
};
