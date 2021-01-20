const { getReviews, createReview, voteReview, VOTE_ACTIONS } = require('dynamodb');

exports.Mutation = {
  createReview: async (parent, { input }, { user }) => {
    return await createReview(input, user);
  },
  voteReview: async (parent, { input }, { user }) => {
    return await voteReview(input, user);
  },
};

exports.Review = {
  author: ({ author, anonymous }) => {
    return anonymous ? 'Anonymous' : author;
  },
  myVote: ({ upvotesUserIds, downvotesUserIds }, args, { user }) => { // upvotesUserIds and downvotesUserIds are sets
    if (user) {
      const { email } = user;
      if (upvotesUserIds.values.includes(email)) {
        return VOTE_ACTIONS.UPVOTE;
      }
      if (downvotesUserIds.values.includes(email)) {
        return VOTE_ACTIONS.DOWNVOTE;
      }
    }
    return null;
  },
};

exports.Query = {
  reviews: async (parent, { input }) => {
    return await getReviews(input);
  },
};

exports.ReviewDetails = {};
