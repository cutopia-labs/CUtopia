import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  timetableEntrySchema,
  requiredNumber,
  requiredString,
  createdAt,
} from '../schemas';

export type Timetable = {
  _id: string;
  createdAt: number;
  entries: any[];
  expireAt: number;
  tableName?: string;
};

const timetableSchema = new Schema<Timetable>(
  {
    _id: {
      type: String,
      default: nanoid(8),
    },
    createdAt: createdAt,
    entries: [timetableEntrySchema],
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

const Timetable = model('Timetable', timetableSchema);

export default Timetable;
