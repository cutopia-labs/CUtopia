const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');

const db = new AWS.DynamoDB.DocumentClient();

exports.report = async input => {
  const { cat, identifier, type, description, username } = input;
  const now = new Date().getTime();
  const reportId = nanoid(5);

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      cat,
      createdDate: now,
      id: reportId,
      identifier,
      type,
      username,
      description,
    },
  };

  await db.put(params).promise();
  return reportId;
};

// TODO: maybe remove this function?
exports.reportFeedback = async input => {
  const { feedbackRatings, username } = input;
  const now = new Date().getTime();
  const reportId = nanoid(5);

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      cat: 1, // categories.FEEDBACK,
      createdDate: now,
      id: reportId,
      username,
      feedbackRatings,
    },
  };

  await db.put(params).promise();
  return reportId;
};
