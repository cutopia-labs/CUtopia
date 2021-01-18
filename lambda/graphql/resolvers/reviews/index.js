const { getReviews, createReview, voteReview } = require('dynamodb');

exports.Mutation = {
  createReview: async (parent, { input }) => {
    return await createReview(input);
  },
  voteReview: async (parent, { input }) => {
    return await voteReview(input)
  },
};

exports.Review = {
  author: ({ author, anonymous }) => {
    return anonymous ? 'Anonymous' : author;
  },
};

exports.Query = {
  reviews: async (parent, { input }) => {
    return await getReviews(input);
  },
};

exports.ReviewDetails = {};
