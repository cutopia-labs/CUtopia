import { getDiscussion, sendDiscussionMessage } from 'mongodb';
import { MutationResolvers, QueryResolvers } from '../schemas/types';
import { verifyCourseId } from '../utils';

type DiscussionResolver = {
  Mutation: MutationResolvers;
  Query: QueryResolvers;
};

const discussionResolver: DiscussionResolver = {
  Mutation: {
    sendMessage: async (parent, { input }, { user }) => {
      // verifyCourseId(input.courseId); TODO: NOT SURE CHECK OR NOT
      const { username } = user;
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
      verifyCourseId(input.courseId);
      return await getDiscussion(input);
    },
  },
};

export default discussionResolver;
