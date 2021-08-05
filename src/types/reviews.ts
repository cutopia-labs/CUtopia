export type Grade = 'F' | 'D' | 'C' | 'B' | 'A';

export type RecentReview = {
  id: string;
  courseId: string;
  username: string;
  title?: string;
  createdDate: string;
  overall: number;
  grading: ReviewDetails;
};

export type Review = {
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
