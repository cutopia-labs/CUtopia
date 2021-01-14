const { createReview } = require('dynamodb');

exports.Mutation = {
  createReview: async (parent, { input }) => {
    return await createReview(input);
  },
};
