import { cleanExpiredTimetable } from 'mongodb';

export const handler = async () => {
  console.info('Removing expired timetables...');
  const result = await cleanExpiredTimetable({
    expireDate: Date.now(),
  });
  console.info(`Removed ${result.deletedCount} expired timetables`);
};
