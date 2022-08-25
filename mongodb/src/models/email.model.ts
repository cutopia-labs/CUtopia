import { Email } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { requiredString } from '../constants/schema';

const emailSchema = new Schema<Email>(
  {
    action: requiredString,
    username: requiredString,
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
