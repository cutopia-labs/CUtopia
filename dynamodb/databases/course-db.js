const AWS = require('aws-sdk');
const NodeCache = require('node-cache');

const db = new AWS.DynamoDB.DocumentClient();

const courseCache = new NodeCache({
  stdTTL: 1800,
});

exports.addCourseData = async input => {
  // add course data extracted from reviews to provide review filtering
  // only lecturers and terms can be added
  const { courseId, lecturer, term } = input;

  const params = {
    TableName: process.env.CourseTableName,
    Key: {
      courseId,
    },
    UpdateExpression: 'add lecturers :lecturer, terms :term',
    ExpressionAttributeValues: {
      ':lecturer': db.createSet(lecturer),
      ':term': db.createSet(term),
    },
    ReturnValues: 'ALL_NEW',
  };

  const result = await db.update(params).promise();
  courseCache.set(courseId, result.Attributes);
};

exports.getCourseData = async input => {
  const { courseId } = input;

  const courseData = courseCache.get(courseId);
  if (courseData) {
    return courseData;
  }

  const params = {
    TableName: process.env.CourseTableName,
    Key: {
      courseId,
    },
    ProjectionExpression: 'lecturers, terms',
  };

  const result = await db.get(params).promise();
  courseCache.set(courseId, result.Item);
  return result.Item;
};
