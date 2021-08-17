import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import Timetable from '../models/timetable.model';
import { updateTimetableId } from './user';

const timetableCache = new NodeCache({
  stdTTL: 1800,
});

export const getSharedTimetable = async input =>
  withCache(timetableCache, input.id, async () => {
    const result = await Timetable.findById(input.id);
    if (!result?.createdAt) {
      // throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID.toString());
      return;
    }
    return {
      entries: result.entries,
      tableName: result.tableName,
      createdAt: result.createdAt,
      expire: result.expire,
    };
  });

export const uploadTimetable = async input => {
  const { username, expire } = input;
  const newTimetable = new Timetable({
    ...input,
    expire: expire ? Date.now() : null,
  });

  await updateTimetableId({
    operation: 'add',
    id: newTimetable._id,
    username,
    expire,
  });
  await newTimetable.save();
  return {
    id: newTimetable._id,
    createdAt: newTimetable.createdAt,
  };
};
