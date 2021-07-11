const { reportError, reportFeedback } = require('dynamodb');

exports.Mutation = {
  reportError: async (parent, { input }, { user }) => {
    const { type, description } = input;
    const { username } = user;
    const reportId = await reportError({ type, description, username });
    return reportId
  },
  reportFeedback: async (parent, { input }, { user }) => {
    const { username } = user;
    const reportId = await reportFeedback({ feedbackRatings: input, username });
    return reportId
  },
};
