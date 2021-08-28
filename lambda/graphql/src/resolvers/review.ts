import {
  createReview,
  getReviews,
  getReview,
  editReview,
  voteReview,
} from 'mongodb';
import { VoteAction } from 'cutopia-types/lib/codes';

const reviewsResolver = {
  Mutation: {
    createReview: async (parent, { input }, { user }) => {
      const { username } = user;
      const { id, createdAt } = await createReview({
        ...input,
        username,
      });
      return {
        id,
        createdAt,
      };
    },
    voteReview: async (parent, { input }, { user }) => {
      const { username } = user;
      return await voteReview({
        ...input,
        username,
      });
    },
    editReview: async (parent, { input }, { user }) => {
      const { username } = user;
      return await editReview({
        ...input,
        username,
      });
    },
  },
  Review: {
    username: ({ username, anonymous }) => {
      return anonymous ? 'Anonymous' : username;
    },
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
      return await getReviews(input);
    },
    review: async (parent, { input }) => {
      return await getReview(input);
    },
  },
  ReviewDetails: {},
};

export default reviewsResolver;
