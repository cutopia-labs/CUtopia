import { getDiscussion, sendDiscussionMessage } from 'mongodb';
import { VoteAction } from 'cutopia-types/lib/codes';

const discussionResolver = {
  Mutation: {
    sendMessage: async (parent, { input }, { user }) => {
      const { username } = user || { username: 'test' }; // TODO: REMOVE THE ||
      const id = await sendDiscussionMessage({
        ...input,
        user: username,
      });
      return {
        id,
      };
    },
  },
  Query: {
    discussion: async (parent, { input }) => {
      console.log(input);
      return await getDiscussion(input);
    },
  },
  ReviewDetails: {},
};

export default discussionResolver;
