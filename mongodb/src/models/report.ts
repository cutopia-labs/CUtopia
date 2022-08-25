import { ReportDocument } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';

import { createdAt, requiredNumber, requiredString } from '../constants/schema';

const reportSchema = new Schema<ReportDocument>(
  {
    _id: {
      type: String,
      default: () => nanoid(5),
    },
    createdAt: createdAt,
    cat: requiredNumber,
    username: String,
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
