import NodeCache from 'node-cache';
import Timetable from '../models/timetable.model';
import { updateSharedTimetableId } from './user';

const timetableCache = new NodeCache({
  stdTTL: 1800,
});

export const getSharedTimetable = async input => {
  const { id } = input;
  const timetableData = JSON.parse(timetableCache.get(id) || 'null');
  if (timetableData) {
    return timetableData;
  }
  const result = await Timetable.findById(id);
  if (!result?.createdAt) {
    // throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID);
    return;
  }
  const response = {
    entries: result.entries,
    tableName: result.tableName,
    createdAt: result.createdAt,
    expireAt: result.expireAt,
  };
  timetableCache.set(id, JSON.stringify(response));
  return response;
};

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
