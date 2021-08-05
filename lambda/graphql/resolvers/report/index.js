const { report, reportFeedback } = require('dynamodb');

exports.Mutation = {
  report: async (parent, { input }, { user }) => {
    const { cat, identifier, type, description } = input;
    const { username } = user;
    const reportId = await report({ cat, identifier, type, description, username });
    return reportId;
  },
  reportFeedback: async (parent, { input }, { user }) => {
    const { username } = user;
    const reportId = await reportFeedback({ feedbackRatings: input, username });
    return reportId;
  }
};
