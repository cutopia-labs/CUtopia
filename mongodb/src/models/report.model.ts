import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import { requiredNumber, requiredString } from '../schemas';

type Report = {
  _id: string;
  createdDate: number;
  cat: number;
  username: string;
  description: string;
  types?: number[];
  identifier?: string;
};

const reportSchema = new Schema<Report>(
  {
    _id: {
      type: String,
      default: nanoid(5),
    },
    createdDate: {
      type: Number,
      default: +new Date(),
    },
    cat: requiredNumber,
    username: requiredString,
    description: requiredString,
    types: [requiredNumber],
    identifier: String,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

const Report = model<Report>('Report', reportSchema);

export default Report;
