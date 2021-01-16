const { nanoid } = require('nanoid');
const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

exports.createReview = async (input) => {
  const now = new Date().getTime().toString();
  const { subject, courseCode, ...reviewData } = input;

  const courseId = `${subject}${courseCode}`;
  const reviewId = nanoid(10);

  const params = {
    TableName: process.env.ReviewsTableName,
    Item: {
      "courseId": courseId,
      "reviewId": reviewId,
      "createdDate": now,
      "modifiedDate": now,
      ...reviewData,
    },
  };

  try {
    await db.put(params).promise();
    return {
      id: reviewId,
      createdTime: now,
    };
  } catch (e) {
    return {
      errorMessage: e,
    }
  }
};

exports.getReviews = async (input) => {
  const { subject, courseCode, limit = 20 } = input;

  const courseId = `${subject}${courseCode}`;
  const params = {
    TableName: process.env.ReviewsTableName,
    KeyConditionExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": courseId,
    },
    Limit: limit,
  };

  try {
    const reviews = (await db.query(params).promise()).Items;
    return reviews.map(review => {
      const { courseId, reviewId, ...rest } = review;
      return {
        ...rest,
        id: reviewId,
      };
    });
  } catch (e) {
    console.warn(e);
  }
};
