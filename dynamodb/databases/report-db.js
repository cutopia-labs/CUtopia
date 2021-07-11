const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');

const db = new AWS.DynamoDB.DocumentClient();

const categories = Object.freeze({
  ERROR: 0,
  FEEDBACK: 1,
});

exports.reportError = async (input) => {
  const { type, description, username } = input;
  const now = new Date().getTime();
  const reportId = nanoid(5);

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      cat: categories.ERROR,
      createdDate: now,
      id: reportId,
      type,
      username,
      description,
    },
  };

  await db.put(params).promise();
  return reportId;
};

exports.reportFeedback = async (input) => {
  const { feedbackRatings, username } = input;
  const now = new Date().getTime();
  const reportId = nanoid(5);

  feedbackRatings.forEach(feedback => {
    if (feedback.rating < 0 || feedback.rating > 4) {
      throw Error('rating must fall within the inclusive range of 0 to 4.');
    }
  });

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      cat: categories.FEEDBACK,
      createdDate: now,
      id: reportId,
      username,
      feedbackRatings,
    },
  };

  await db.put(params).promise();
  return reportId;
};
