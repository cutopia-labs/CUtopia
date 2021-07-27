const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');

const db = new AWS.DynamoDB.DocumentClient();

exports.REPORT_CATEGORIES = Object.freeze({
  ERROR: 0,
  FEEDBACK: 1,
  COURSE: 2,
  REVIEW: 3,
});

exports.REVIEW_REPORT_TYPES = Object.freeze({
  OTHER: 0,
  HATE_SPEECH: 1,
  PERSONAL_ATTACK: 2,
  SPAM: 3,
  MISLEADING: 4,
})

exports.COURSE_REPORT_TYPES = Object.freeze({
  OTHER: 0,
  COURSE_TITLE: 1,
  CREDITS: 2,
  ASSESSMENTS: 3,
  REQUIREMENTS: 4,
  DESCRIPTION: 5,
});

exports.report = async (input) => {
  const { cat, type, description, username } = input;
  const now = new Date().getTime();
  const reportId = nanoid(5);

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      cat,
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
