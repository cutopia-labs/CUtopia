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

exports.Course = {
  reviews: async ({ course, idsContext }) => {
    const { subject } = idsContext;
    const courseCode = course.code;
    return await getReviews({ subject, courseCode });
  },
};

exports.ReviewDetails = {};
