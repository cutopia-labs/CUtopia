const { report } = require('dynamodb');

exports.Mutation = {
  report: async (parent, { input }, { user }) => {
    const { type, description } = input;
    const { username } = user;
    const reportId = await report({ type, description, username });
    return reportId
  },
};
