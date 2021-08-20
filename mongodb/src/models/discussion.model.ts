import { model, Schema } from 'mongoose';
import { courseId, createdAt, requiredString } from '../schemas';

export type DiscussionMessage = {
  _id: number;
  text: string;
  user: string;
};

export type Discussion = {
  _id: string;
  messages: [DiscussionMessage];
};

const discussionMessageSchema = new Schema<DiscussionMessage>(
  {
    _id: createdAt,
    text: requiredString,
    user: requiredString,
  },
  {
    _id: false,
    versionKey: false,
  }
);

const discussionSchema = new Schema<Discussion>(
  {
    _id: courseId,
    messages: {
      type: [discussionMessageSchema],
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const DiscussionModel = model<Discussion>('Discussion', discussionSchema);

export default DiscussionModel;
