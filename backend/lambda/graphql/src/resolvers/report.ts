import { report } from 'mongodb';

import { Resolvers } from '../schemas/types';

const reportResolver: Resolvers = {
  Mutation: {
    report: async (parent, { input }, context) => {
      const reportId = await report({
        ...input,
        username: context.user?.username,
      });
      return reportId;
    },
  },
};

export default reportResolver;
