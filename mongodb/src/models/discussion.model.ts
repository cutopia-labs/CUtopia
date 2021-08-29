import { Discussion, DiscussionMessage } from 'cutopia-types/lib/types';
import { model, Schema } from 'mongoose';
import { courseId, createdAt, requiredString } from '../schemas';

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
    numMessages: { type: Number, default: 0 },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const DiscussionModel = model<Discussion>('Discussion', discussionSchema);

export default DiscussionModel;
