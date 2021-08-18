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
  expire: number;
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
  await this.model('User').updateOne(
    { username: doc.username },
    {
      $pull: {
        [timetableField]: doc._id,
      },
    }
  );
});

const Timetable = model('Timetable', timetableSchema);

export default Timetable;
