const { getReviews, createReview } = require('dynamodb');

exports.Mutation = {
  createReview: async (parent, { input }) => {
    return await createReview(input);
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
