import { Schema } from 'mongoose';

const requiredNumber = {
  type: Number,
  required: true,
};
const requiredString = {
  type: String,
  required: true,
};

const createdDate = {
  type: Number,
  default: +new Date(),
};

const ratingSchema = {
  type: Number,
  required: true,
  min: 0,
  max: 4,
};

const timetableSectionSchema = new Schema(
  {
    days: [requiredString],
    endTimes: [requiredString],
    startTimes: [requiredString],
    instructors: [requiredString],
    locations: [requiredString],
    name: String,
  },
  {
    _id: false,
    versionKey: false,
  }
);

const timetableEntrySchema = new Schema(
  {
    courseId: requiredString,
    title: requiredString,
    credits: requiredNumber,
    sections: [timetableSectionSchema],
  },
  {
    _id: false,
    versionKey: false,
  }
);

export {
  requiredNumber,
  requiredString,
  createdDate,
  ratingSchema,
  timetableSectionSchema,
  timetableEntrySchema,
};
