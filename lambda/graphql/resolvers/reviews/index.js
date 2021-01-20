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
  upvotesUserIds: ({ upvotesUserIds }) => { // upvotesUserIds is a set
    return upvotesUserIds.values.filter(id => id); // filter out empty string
  },
  downvotesUserIds: ({ downvotesUserIds }) => { // downvotesUserIds is a set
    return downvotesUserIds.values.filter(id => id); // filter out empty string
  },
};

exports.Query = {
  reviews: async (parent, { input }) => {
    return await getReviews(input);
  },
};

exports.ReviewDetails = {};
