import { Timetable } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  timetableEntrySchema,
  requiredNumber,
  requiredString,
  createdAt,
} from '../schemas';
import User from './user.model';

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
timetableSchema.post('deleteOne', async function () {
  // `this` is Query instead of Document
  const { _id, username, expire } = (this as any).getFilter();
  const timetableField = expire >= 0 ? 'sharedTimetables' : 'timetables';
  await User.updateOne(
    { username: username },
    {
      $pull: {
        [timetableField]: _id,
      },
    }
  ).exec();
});

const Timetable = model<Timetable>('Timetable', timetableSchema);

export default Timetable;
