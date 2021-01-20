const { getReviews, createReview, voteReview } = require('dynamodb');

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
  upvoteUserIds: ({ upvoteUserIds }) => { // upvoteUserIds is a set
    return upvoteUserIds.values.filter(id => id); // filter out empty string
  },
  downvoteUserIds: ({ downvoteUserIds }) => { // downvoteUserIds is a set
    return downvoteUserIds.values.filter(id => id); // filter out empty string
  },
};

exports.Query = {
  reviews: async (parent, { input }) => {
    return await getReviews(input);
  },
};

exports.ReviewDetails = {};
