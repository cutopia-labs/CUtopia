import { Timetable } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';

import { requiredNumber, requiredString, createdAt } from '../constants/schema';

const timetableSection = {
  days: [requiredString],
  endTimes: [requiredString],
  startTimes: [requiredString],
  instructors: [requiredString],
  locations: [requiredString],
  hide: {
    type: Boolean,
    default: false,
  },
  name: String,
};

const timetableEntry = {
  courseId: requiredString,
  title: requiredString,
  credits: requiredNumber,
  sections: [timetableSection],
};

const timetableSchema = new Schema<Timetable>(
  {
    _id: {
      type: String,
      default: () => nanoid(10),
    },
    createdAt: createdAt,
    entries: [timetableEntry],
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
