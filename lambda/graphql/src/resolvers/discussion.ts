import { getDiscussion, sendDiscussionMessage } from 'mongodb';
import { verifyCourseId } from '../utils';

const discussionResolver = {
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
  ReviewDetails: {},
};

export default discussionResolver;
