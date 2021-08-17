import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';
import { timetableEntrySchema, requiredString, createdAt } from '../schemas';

export type Timetable = {
  _id: string;
  createdAt: number;
  entries: any[];
  expire: number;
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
    expire: {
      // expired 30 days after creation
      type: Number,
      expires: 60 * 60 * 24 * 30,
    },
    username: requiredString,
    tableName: String,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);
timetableSchema.post('remove', async function (doc) {
  const timetableField = doc.expire ? 'sharedTimetables' : 'timetables';
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
