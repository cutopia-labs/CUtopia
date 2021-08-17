import { report } from 'mongodb';

const reportResolver = {
  Mutation: {
    report: async (parent, { input }, { user }) => {
      const { username } = user;
      const reportId = await report({
        ...input,
        username,
      });
      return reportId;
    },
    /*
    reportFeedback: async (parent, { input }, { user }) => {
      const { username } = user;
      const reportId = await reportFeedback({
        feedbackRatings: input,
        username,
      });
      return reportId;
    },
    */
  },
};

export default reportResolver;
