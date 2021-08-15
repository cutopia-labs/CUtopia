import NodeCache from 'node-cache';
import Timetable from '../models/timetable.model';

const timetableCache = new NodeCache({
  stdTTL: 1800,
});

export const getSharedTimetable = async input => {
  const { id } = input;
  const now = +new Date();

  const timetableData = timetableCache.get(id);

  if (timetableData) {
    return timetableData;
  }

  const result = await Timetable.findById(id);
  if (result === undefined) {
    // throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID);
  }

  const expireDate = result.createdDate + result.expire * 60 * 1000;

  timetableCache.set(id, result);

  return {
    entries: result.entries,
    tableName: result.tableName,
    createdDate: result.createdDate,
    expireDate,
  };
};

export const shareTimetable = async input => {
  const newTimetable = new Timetable(input);
  await newTimetable.save();
  return {
    id: newTimetable._id,
    createdDate: newTimetable.createdDate,
  };
};
