import { getDiscussion, sendDiscussionMessage } from 'mongodb';
import { Resolvers } from '../schemas/types';

const discussionResolver: Resolvers = {
  Mutation: {
    sendMessage: async (parent, { input }, { user }) => {
      const { username } = user;
      const id = await sendDiscussionMessage({
        ...input,
        user: username,
      });
      return { id };
    },
  },
  Query: {
    discussion: async (parent, { input }) => getDiscussion(input),
  },
};

export default discussionResolver;
