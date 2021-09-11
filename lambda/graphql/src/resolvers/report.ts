import { report } from 'mongodb';
import { MutationResolvers } from '../schemas/types';

type ReportResolver = {
  Mutation: MutationResolvers;
};

const reportResolver: ReportResolver = {
  Mutation: {
    report: async (parent, { input }, { user }) => {
      const { username } = user;
      const reportId = await report({
        ...input,
        username,
      });
      return reportId;
    },
  },
};

export default reportResolver;
