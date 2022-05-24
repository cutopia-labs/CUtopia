import { report } from 'mongodb';
import { Resolvers } from '../schemas/types';

const reportResolver: Resolvers = {
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
