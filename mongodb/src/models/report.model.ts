import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import { createdAt, requiredNumber, requiredString } from '../schemas';
import { ReportDocument } from 'cutopia-types/lib/types';

const reportSchema = new Schema<ReportDocument>(
  {
    _id: {
      type: String,
      default: () => nanoid(5),
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

const Report = model<ReportDocument>('Report', reportSchema);

export default Report;
