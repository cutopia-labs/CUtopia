import { Timetable } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  timetableEntrySchema,
  requiredNumber,
  requiredString,
  createdAt,
} from '../schemas';

const timetableSchema = new Schema<Timetable>(
  {
    _id: {
      type: String,
      default: () => nanoid(10),
    },
    createdAt: createdAt,
    entries: [timetableEntrySchema],
    expire: requiredNumber,
    expireAt: requiredNumber,
    username: requiredString,
    tableName: String,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

const Timetable = model<Timetable>('Timetable', timetableSchema);

export default Timetable;
