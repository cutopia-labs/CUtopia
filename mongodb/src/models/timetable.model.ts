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
      default: () => nanoid(8),
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
timetableSchema.virtual('id').get(function () {
  return this._id;
});
timetableSchema.post('remove', async function (doc) {
  const timetableField = doc.expire >= 0 ? 'sharedTimetables' : 'timetables';
  await (this as any).model('User').updateOne(
    { username: doc.username },
    {
      $pull: {
        [timetableField]: doc._id,
      },
    }
  );
});

const Timetable = model<Timetable>('Timetable', timetableSchema);

export default Timetable;
