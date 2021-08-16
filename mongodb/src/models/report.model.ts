import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import { createdAt, requiredNumber, requiredString } from '../schemas';

type Report = {
  _id: string;
  createdAt: number;
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
    createdAt: createdAt,
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
