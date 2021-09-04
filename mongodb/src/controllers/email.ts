import { Email as EmailType } from 'cutopia-types/lib/types';
import Email from '../models/email.model';

export const addToResendList = async (input: EmailType) => {
  const { action, SID } = input;
  const exists = await Email.exists({ action, SID });
  if (!exists) {
    const email = new Email(input);
    await email.save();
  }
};

export const getResendList = async filter => Email.find(filter).exec();

export const removeFromResendList = async filter =>
  Email.findOneAndDelete(filter).exec();
