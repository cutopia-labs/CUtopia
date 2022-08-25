import { VoteAction } from 'cutopia-types/lib/codes';
import {
  createReview,
  getReviews,
  getReview,
  editReview,
  voteReview,
  formatReviewId,
} from 'mongodb';
import NodeCache from 'node-cache';

import { Resolvers } from '../schemas/types';
import withCache from '../utils/withCache';

const reviewCache = new NodeCache({ stdTTL: 600 });

const reviewsResolver: Resolvers = {
  Mutation: {
    createReview: async (parent, { input }, { user }) => {
      const { username } = user;
      const { createdAt } = await createReview({
        ...input,
        username,
      });
      return { createdAt };
    },
    voteReview: async (parent, { input }, { user }) => {
      const { username } = user;
      await voteReview({
        ...input,
        username,
      });
    },
    editReview: async (parent, { input }, { user }) => {
      const { username } = user;
      await editReview({
        ...input,
        username,
      });
    },
  },
  Review: {
    username: ({ username, anonymous }) => (anonymous ? 'Anonymous' : username),
    myVote: ({ upvoteUserIds, downvoteUserIds }, args, { user }) => {
      if (user) {
        const { username } = user;
        if (upvoteUserIds.includes(username)) {
          return VoteAction.UPVOTE;
        }
        if (downvoteUserIds.includes(username)) {
          return VoteAction.DOWNVOTE;
        }
      }
      return null;
    },
  },
  Query: {
    reviews: async (parent, { input }) => {
      const { courseId, page } = input;
      return withCache(
        reviewCache,
        courseId ? JSON.stringify(input) : `latest#${page || 0}`,
        async () => getReviews(input)
      );
    },
    review: async (parent, { input }) => {
      const { courseId, createdAt } = input;
      return withCache(
        reviewCache,
        formatReviewId(courseId, createdAt),
        async () => getReview(input)
      );
    },
  },
  ReviewDetails: {},
};

export default reviewsResolver;
