import NodeCache from 'node-cache';
import withCache from '../utils/withCache';
import Timetable from '../models/timetable.model';
import { updateSharedTimetableId } from './user';

const timetableCache = new NodeCache({
  stdTTL: 1800,
});

export const getSharedTimetable = async input =>
  withCache(timetableCache, input.id, async () => {
    const result = await Timetable.findById(input.id);
    if (!result?.createdAt) {
      // throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID);
      return;
    }
    return {
      entries: result.entries,
      tableName: result.tableName,
      createdAt: result.createdAt,
      expireAt: result.expireAt,
    };
  });

export const shareTimetable = async input => {
  const { username } = input;
  const newTimetable = new Timetable(input);
  await updateSharedTimetableId({
    operation: 'add',
    id: newTimetable._id,
    username,
  });
  await newTimetable.save();
  return {
    id: newTimetable._id,
    createdAt: newTimetable.createdAt,
  };
};
