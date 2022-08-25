const { connect, rankCourses } = require('mongodb');
require('dotenv').config();

exports.handler = async () => {
  await connect(process.env.ATLAS_URI);

  console.time('Rank courses');
  await rankCourses();
  console.timeEnd('Rank courses');
};
