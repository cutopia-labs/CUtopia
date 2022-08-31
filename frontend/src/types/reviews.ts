import { Review as ReviewRaw } from 'cutopia-types';

export type ReviewTerm = 'Term 1' | 'Term 2' | 'Summer';

export type Review = ReviewRaw & {
  myVote?: number;
};
