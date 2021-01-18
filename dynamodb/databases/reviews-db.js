const { nanoid } = require('nanoid');
const NodeCache = require('node-cache');
const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

exports.createReview = async (input) => {
  const now = new Date().getTime().toString();
  const { subject, courseCode, ...reviewData } = input;

  const courseId = `${subject}${courseCode}`;
  const reviewId = nanoid(10);

  // parameters for inserting new review into reviews database
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

  // parameters for inserting new review into latest reviews database
  const params2 = {
    TableName: process.env.LatestReviewsTableName,
    Item: {
      "primaryKey": "reviews-latest",
      "sortKey": `${now}#${reviewId}`,
      "courseId": courseId,
      "reviewId": reviewId,
      "createdDate": now,
      "modifiedDate": now,
      ...reviewData,
    },
  };

  try {
    await db.put(params).promise();
    await db.put(params2).promise();

    return {
      id: reviewId,
      createdTime: now,
    };
  } catch (e) {
    console.trace(e);
    return {
      errorMessage: e,
    }
  }
};

const latestReviewsCache = new NodeCache({
  stdTTL: 300
});
const numOfLatestReviews = 20;

exports.getReviews = async (input) => {
  const { courseId, limit = 20, ascendingDate = true } = { ...input };

  if (courseId) {
    // return reviews of a course
    const params = {
      TableName: process.env.ReviewsTableName,
      KeyConditionExpression: "courseId = :courseId",
      ExpressionAttributeValues: {
        ":courseId": courseId,
      },
      ScanIndexForward: ascendingDate,
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
  } else {
    // return latest reviews from cache
    const cachedReviews = latestReviewsCache.get(`reviews-latest-${ascendingDate}`);
    if (cachedReviews) {
      return cachedReviews;
    }

    // return latest reviews from database
    const params = {
      TableName: process.env.LatestReviewsTableName,
      KeyConditionExpression: "primaryKey = :key",
      ExpressionAttributeValues: {
        ":key": "reviews-latest",
      },
      ScanIndexForward: ascendingDate,
      Limit: numOfLatestReviews,
    };

    try {
      const latestReviews = (await db.query(params).promise()).Items.map(review => {
        const { primaryKey, sortKey, reviewId, ...reviewData } = review;
        return {
          id: reviewId,
          ...reviewData,
        };
      });
      latestReviewsCache.set(`reviews-latest-${ascendingDate}`, latestReviews);
      return latestReviews;
    } catch (e) {
      console.trace(e);
    }
  }
};
