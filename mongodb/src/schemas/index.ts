import { Schema } from 'mongoose';
import { toSeconds, toMilliseconds } from '../utils';

export const unixTimestampInSeconds = {
  type: Number,
  get: toMilliseconds,
  set: toSeconds,
};

export const unixTimestampInSecondsRequired = {
  ...unixTimestampInSeconds,
  require: true,
};

export const requiredNumber = {
  type: Number,
  required: true,
};
export const requiredString = {
  type: String,
  required: true,
};

export const courseId = requiredString;

export const createdAt = {
  type: Number,
  default: () => +new Date(),
};

export const ratingSchema = {
  type: Number,
  required: true,
  min: 0,
  max: 4,
};

export const timetableSectionSchema = new Schema(
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

export const timetableEntrySchema = new Schema(
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
