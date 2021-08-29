import DiscussionModel from '../models/discussion.model';
import { MESSAGES_PER_PAGE } from '../constant/configs';
import { updateDiscussions } from './user';

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
  await updateDiscussions({
    username: messageBody.user,
    courseId,
    text: messageBody.text,
  });
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
  console.log(`curr page ${page}`);
  return {
    messages: discussion?.messages,
    nextPage:
      page * MESSAGES_PER_PAGE >= (discussion?.numMessages || 0) ? null : page,
  };
};
