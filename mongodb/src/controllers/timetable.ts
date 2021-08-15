import NodeCache from 'node-cache';
import Timetable from '../models/timetable.model';

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
  if (!result?.createdDate) {
    // throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID);
    return;
  }
  const response = {
    entries: result.entries,
    tableName: result.tableName,
    createdDate: result.createdDate,
    expireDate: result.createdDate + result.expire * 60 * 1000,
  };
  timetableCache.set(id, JSON.stringify(response));
  return response;
};

export const shareTimetable = async input => {
  const newTimetable = new Timetable(input);
  await newTimetable.save();
  return {
    id: newTimetable._id,
    createdDate: newTimetable.createdDate,
  };
};
