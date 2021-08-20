import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import DiscussionModel from '../models/discussion.model';

const discussionCache = new NodeCache({
  stdTTL: 1800,
});

type SendDiscussionMessageProps = {
  courseId: string;
  text: string;
  user: string;
};

export const sendDiscussionMessage = async (
  input: SendDiscussionMessageProps
) => {
  const { courseId, ...messageBody } = input;
  await DiscussionModel.findByIdAndUpdate(
    courseId,
    {
      $push: {
        messages: {
          ...messageBody,
          _id: +new Date(),
        },
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
};

export const getDiscussion = async (courseId: string) => {
  return await DiscussionModel.findById(courseId);
};
