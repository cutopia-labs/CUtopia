const { getReviews, getReview, createReview, voteReview, VOTE_ACTIONS } = require('dynamodb');

exports.Mutation = {
  createReview: async (parent, { input }, { user }) => {
    return await createReview(input, user);
  },
  voteReview: async (parent, { input }, { user }) => {
    return await voteReview(input, user);
  },
};

exports.Review = {
  username: ({ username, anonymous }) => {
    return anonymous ? 'Anonymous' : username;
  },
  myVote: ({ upvotesUserIds, downvotesUserIds }, args, { user }) => { // upvotesUserIds and downvotesUserIds are sets
    if (user) {
      const { username } = user;
      if (upvotesUserIds.values.includes(username)) {
        return VOTE_ACTIONS.UPVOTE;
      }
      if (downvotesUserIds.values.includes(username)) {
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
  review: async (parent, { input }) => {
    return await getReview(input);
  },
};

exports.ReviewDetails = {};
