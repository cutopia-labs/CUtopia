const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();

exports.addLecturerToCourse = async (input) => {
  const { courseId, lecturer } = input;

  const params = {
    TableName: process.env.CourseTableName,
    Key: {
      courseId
    },
    UpdateExpression: 'add lecturers :lecturer',
    ExpressionAttributeValues: {
      ':lecturer': db.createSet(lecturer)
    }
  };

  await db.update(params).promise();
};

exports.getCourseLecturers = async (input) => {
  const { courseId } = input;

  const params = {
    TableName: process.env.CourseTableName,
    Key: {
      courseId
    },
    ProjectionExpression: 'lecturers'
  };

  const result = await db.get(params).promise();
  return result.Item === undefined ? [] : result.Item.lecturers.values;
};
