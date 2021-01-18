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
      "upvote": 0,
      "downvote": 0,
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
      "upvote": 0,
      "downvote": 0,
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

exports.voteReview = async (input) => {
  const { courseId, createdDate, vote } = input;
  if (vote !== 1 && vote !== -1) {
    throw Error("Vote must be either +1 or -1");
  }

  const params = {
    TableName: process.env.ReviewsTableName,
    Key: {
      courseId,
      createdDate,
    },
    UpdateExpression: vote === 1 ? "set upvote = upvote + :val" : "set downvote = downvote + :val",
    ExpressionAttributeValues: {
      ":val": 1,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const result = await db.update(params).promise();
    const { reviewId, ...reviewData } = result.Attributes;
    return {
      review: {
        id: reviewId,
        ...reviewData,
      },
    }
  } catch (e) {
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
  const { courseId, limit = 20, ascendingDate, ascendingVote } = { ...input };

  if (courseId) {
    // return reviews of a course
    const sortByVotes = ascendingVote != null;
    const sortByDate = ascendingDate != null;
    if (sortByVotes && sortByDate) {
      throw Error("Either sort by votes or date.");
    }

    let params = null;
    if (sortByDate) {
      params = {
        TableName: process.env.ReviewsTableName,
        KeyConditionExpression: "courseId = :courseId",
        ExpressionAttributeValues: {
          ":courseId": courseId,
        },
        ScanIndexForward: ascendingDate,
        Limit: limit,
      };
    } else if (sortByVotes) {
      params = {
        TableName: process.env.ReviewsTableName,
        Index: process.env.ReviewsByVoteIndexName,
        KeyConditionExpression: "courseId = :courseId",
        ExpressionAttributeValues: {
          ":courseId": courseId,
        },
        ScanIndexForward: ascendingVote,
        Limit: limit,
      };
    } else {
      params = {
        TableName: process.env.ReviewsTableName,
        KeyConditionExpression: "courseId = :courseId",
        ExpressionAttributeValues: {
          ":courseId": courseId,
        },
        Limit: limit,
      };
    }

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
