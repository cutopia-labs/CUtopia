import { Email } from 'cutopia-types';
import { Schema, model } from 'mongoose';

import { requiredString } from '../constants/schema';

const emailSchema = new Schema<Email>(
  {
    action: requiredString,
    username: {
      type: String,
      required: function () {
        return this.action === 'create';
      },
    },
    userId: {
      type: String,
      required: function () {
        return this.action === 'resetPwd';
      },
    },
    SID: requiredString,
    code: String,
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const EmailModel = model<Email>('Email', emailSchema);

export default EmailModel;
