import { Discussion } from 'cutopia-types';
import { model, Schema } from 'mongoose';

import { createdAt, requiredString } from '../constants/schema';

const discussionMessage = {
  _id: createdAt,
  text: requiredString,
  user: requiredString,
};

const discussionSchema = new Schema<Discussion>(
  {
    _id: requiredString,
    messages: {
      type: [discussionMessage],
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
