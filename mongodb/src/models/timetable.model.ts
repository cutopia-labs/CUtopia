import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import {
  timetableEntrySchema,
  requiredNumber,
  requiredString,
} from '../schemas';

type Timetable = {
  _id: string;
  createdDate: number;
  entries: any[];
  expire: number;
  tableName?: string;
};

const Schema = mongoose.Schema;

const timetableSchema = new Schema<Timetable>(
  {
    _id: {
      type: String,
      default: nanoid(8),
    },
    createdDate: {
      type: Number,
      default: +new Date(),
    },
    entries: [timetableEntrySchema],
    expire: requiredNumber,
    username: requiredString,
    tableName: String,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
