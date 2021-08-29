const { connect, cleanExpiredTimetable } = require('mongodb');
require('dotenv').config();

exports.handler = async () => {
  await connect(process.env.ATLAS_URI);

  console.time('Remove expired timetables');
  const result = await cleanExpiredTimetable({
    expireDate: Date.now(),
  });
  console.timeEnd('Remove expired timetables');
  console.log(`Removed ${result.deletedCount} expired timetables`);
};
