import NodeCache from 'node-cache';
import { ErrorCode } from 'cutopia-types/lib/codes';

import withCache from '../utils/withCache';
import Timetable from '../models/timetable.model';
import { updateTimetableId } from './user';

const timetableCache = new NodeCache({
  stdTTL: 1800,
});

export const getTimetable = async input =>
  withCache(timetableCache, input._id, async () => {
    const timetable = await Timetable.findById(input._id);
    if (!timetable) {
      throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
    }
    if (timetable.expire === -1 && input.username !== timetable.username) {
      throw Error(ErrorCode.GET_TIMETABLE_UNAUTHORIZED.toString());
    }
    return timetable;
  });

export const uploadTimetable = async input => {
  const { username, expire } = input;
  const newTimetable = new Timetable({
    ...input,
    expire,
    expireAt: expire > 0 ? +new Date() + expire * 24 * 60 * 60 * 1000 : -1,
  });

  await updateTimetableId({
    operation: 'add',
    _id: newTimetable._id,
    username,
    expire,
  });
  await newTimetable.save();
  return {
    _id: newTimetable._id,
    createdAt: newTimetable.createdAt,
  };
};

export const removeTimetable = async input => {
  const { username, _id } = input;
  return await Timetable.deleteOne({
    _id,
    username,
  });
};

export const cleanExpiredTimetable = async input => {
  const { expireDate } = input;
  return await Timetable.deleteMany({
    $and: [
      {
        expireAt: {
          $lt: expireDate,
        },
        expire: {
          $gt: 0,
        },
      },
    ],
  });
};
