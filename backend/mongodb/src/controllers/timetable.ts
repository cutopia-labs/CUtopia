import { ErrorCode } from 'cutopia-types';
import { nanoid } from 'nanoid';

import {
  UPLOAD_TIMETABLE_ENTRY_LIMIT,
  UPLOAD_TIMETABLE_TOTAL_LIMIT,
} from '../constants/config';
import Timetable from '../models/timetable';
import User from '../models/user';
import { canReadTimetable } from '../policies/timetable';

import { updateTimetableId } from './user';

export const getTimetable = async input => {
  const timetable = await Timetable.findById(input._id);
  if (!timetable) {
    throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  }
  if (!canReadTimetable(timetable, input.username)) {
    throw Error(ErrorCode.GET_TIMETABLE_UNAUTHORIZED.toString());
  }
  return timetable;
};

export const uploadTimetable = async input => {
  const { _id, username, expire, entries } = input;
  if (entries?.length > UPLOAD_TIMETABLE_ENTRY_LIMIT) {
    throw Error(ErrorCode.UPLOAD_TIMETABLE_EXCEED_ENTRY_LIMIT.toString());
  }

  const user = await User.findOne({ username }, 'timetables').exec();
  if (user.timetables.length > UPLOAD_TIMETABLE_TOTAL_LIMIT && !_id) {
    throw Error(ErrorCode.UPLOAD_TIMETABLE_EXCEED_TOTAL_LIMIT.toString());
  }

  if (expire !== undefined) {
    input.expireAt =
      expire > 0 ? +new Date() + expire * 24 * 60 * 60 * 1000 : -1;
  }

  if (_id) {
    const result = await Timetable.updateOne({ _id, username }, input);
    if (!result.matchedCount)
      throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  } else {
    const newTimetable = new Timetable(input);
    await saveOwnedTimetable(newTimetable, username);
    return {
      _id: newTimetable._id,
      createdAt: newTimetable.createdAt,
    };
  }
};

const saveOwnedTimetable = async (timetable, username: string) => {
  await timetable.save();
  // Keep the record if the account update has an ambiguous network outcome.
  // A later reconciliation can recover it without leaving a dangling pointer.
  await updateTimetableId({ operation: 'add', _id: timetable._id, username });
};

export const removeTimetable = async input => {
  let { _id, switchTo, username } = input;
  if (switchTo && !(await Timetable.exists({ _id: switchTo, username }))) {
    throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  }

  if (switchTo === null) {
    // No timetable left after removing this last timetable
    // so create a new empty timetable
    switchTo = (await uploadTimetable({ username, expire: -1, entries: [] }))
      ._id;
  }
  await updateTimetableId({
    operation: 'remove',
    _id,
    switchTo,
    username,
  });
  await Timetable.deleteOne({ _id, username }).exec();
  if (switchTo) {
    return await Timetable.findOne({ username, _id: switchTo }).exec();
  }
};

export const cleanExpiredTimetable = async input => {
  const { expireDate } = input;
  return await Timetable.updateMany(
    {
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
    },
    {
      expireAt: -1,
      expire: -1,
    }
  );
};

export const switchTimetable = async input => {
  const { _id, username } = input;
  const timetable = await Timetable.findOne({ username, _id });
  if (!timetable) throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  const updated = await User.updateOne(
    { username, timetables: _id },
    { $set: { timetableId: _id } }
  ).exec();
  if (!updated.matchedCount)
    throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  return timetable;
};

export const cloneTimetable = async input => {
  const { _id, username } = input;
  const timetable = await Timetable.findOne({ _id }).lean();
  if (!timetable) {
    throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
  }
  if (!canReadTimetable(timetable, username)) {
    throw Error(ErrorCode.GET_TIMETABLE_UNAUTHORIZED.toString());
  }
  const newTimetable = new Timetable({
    ...timetable,
    username,
    _id: nanoid(10),
    expire: -1,
    expireAt: -1,
  });
  await saveOwnedTimetable(newTimetable, username);
  return newTimetable;
};
