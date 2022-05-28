import {
  createReview,
  getReviews,
  getReview,
  editReview,
  voteReview,
} from 'mongodb';
import { VoteAction } from 'cutopia-types/lib/codes';

import { Resolvers } from '../schemas/types';

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
    reviews: async (parent, { input }) => getReviews(input),
    review: async (parent, { input }) => getReview(input),
  },
  ReviewDetails: {},
};

export default reviewsResolver;
