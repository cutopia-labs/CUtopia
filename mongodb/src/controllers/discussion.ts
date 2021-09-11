import DiscussionModel from '../models/discussion.model';
import { MESSAGES_PER_PAGE } from '../constant/configs';

type SendDiscussionMessageProps = {
  courseId: string;
  text: string;
  user: string;
};

export const sendDiscussionMessage = async (
  input: SendDiscussionMessageProps
) => {
  const { courseId, ...messageBody } = input;
  const messageId = +new Date();
  await DiscussionModel.findByIdAndUpdate(
    courseId,
    {
      $push: {
        messages: {
          ...messageBody,
          _id: messageId,
        },
      },
      $inc: {
        numMessages: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  return messageId;
};

type GetDiscussionProps = {
  courseId: string;
  page?: number;
};

export const getDiscussion = async ({ courseId, page }: GetDiscussionProps) => {
  page = page || 0;
  const discussion = await DiscussionModel.findById(courseId, {
    messages: {
      $slice: ['$messages', -(++page * MESSAGES_PER_PAGE), MESSAGES_PER_PAGE],
    },
    numMessages: '$numMessages',
  });
  return {
    messages: discussion?.messages?.map(message => ({
      ...message,
      id: message._id,
    })),
    nextPage:
      page * MESSAGES_PER_PAGE >= (discussion?.numMessages || 0) ? null : page,
  };
};
