const { nanoid } = require('nanoid');
const NodeCache = require('node-cache');
const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

const latestReviewsCache = new NodeCache({
  stdTTL: 300,
});
const numOfLatestReviews = 20;

exports.createReview = async (input, user) => {
  const now = new Date().getTime().toString();
  const { courseId, ...reviewData } = input;
  const reviewId = nanoid(10);
  const { email } = user;

  const review = {
    "courseId": courseId,
    "reviewId": reviewId,
    "createdDate": now,
    "modifiedDate": now,
    "upvotes": 0,
    "upvotesUserIds": db.createSet([""]),
    "downvotes": 0,
    "downvotesUserIds": db.createSet([""]),
    ...reviewData,
  };

  // parameters for inserting new review into reviews database
  const addReviewParams = {
    TableName: process.env.ReviewsTableName,
    Item: review,
  };

  const latestReview = {
    ...review,
    "primaryKey": "reviews-latest",
    "sortKey": `${now}#${reviewId}`,
  };

  // parameters for inserting new review into latest reviews database
  const addLatestReviewParams = {
    TableName: process.env.LatestReviewsTableName,
    Item: latestReview,
  };

  const addToMyReviewsParams = {
    TableName: process.env.UserTableName,
    Key: {
      email,
    },
    UpdateExpression: "add reviewIds :reviewId",
    ExpressionAttributeValues: {
      ":reviewId": db.createSet(`${courseId}#${now}`),
    },
  };

  try {
    await Promise.all([
      db.put(addReviewParams).promise(),
      db.put(addLatestReviewParams).promise(),
      db.update(addToMyReviewsParams).promise(),
    ]);

    const latestReviews = latestReviewsCache.get("reviews-latest");
    if (latestReviews) {
      latestReviews.unshift(mapReview(latestReview)); // the list is ordered by descending date by default
      latestReviewsCache.set("reviews-latest", latestReviews);
    }

    return {
      id: reviewId,
      createdTime: now,
    };
  } catch (e) {
    console.trace(e);
    return {
      error: e,
    };
  }
};

const VOTE_ACTIONS = Object.freeze({
  DOWNVOTE: 0,
  UPVOTE: 1,
});
exports.voteReview = async (input, user) => {
  const { courseId, createdDate, vote } = input;
  const { email } = user;
  if (vote !== 0 && vote !== 1) {
    throw Error("Vote must be either 0 or 1");
  }

  const isUpvote = vote === VOTE_ACTIONS.UPVOTE;
  const params = {
    TableName: process.env.ReviewsTableName,
    Key: {
      courseId,
      createdDate,
    },
    UpdateExpression:
      (isUpvote ? "set upvotes = upvotes + :val " : "set downvotes = downvotes + :val ") +
      (isUpvote ? "add upvotesUserIds :userIdSet" : "add downvotesUserIds :userIdSet"),
    ConditionExpression: `not (contains(upvotesUserIds, :userId) or contains(downvotesUserIds, :userId))`,
    ExpressionAttributeValues: {
      ":val": 1,
      ":userId": email,
      ":userIdSet": db.createSet(email),
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
    };
  } catch (e) {
    if (e.code === "ConditionalCheckFailedException") {
      return {
        error: "Voted already",
      };
    }
    return {
      error: e,
    };
  }
};

const mapReview = review => {
  const { primaryKey, sortKey, reviewId, ...reviewData } = review;
  return {
    id: reviewId,
    ...reviewData,
  };
};
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
          courseId: courseId,
        };
      });
    } catch (e) {
      console.warn(e);
    }
  } else {
    // return latest reviews from cache
    const cachedReviews = latestReviewsCache.get("reviews-latest");
    if (cachedReviews) {
      return ascendingDate ? cachedReviews.reverse() : cachedReviews;
    }

    // return latest reviews from database
    const params = {
      TableName: process.env.LatestReviewsTableName,
      KeyConditionExpression: "primaryKey = :key",
      ExpressionAttributeValues: {
        ":key": "reviews-latest",
      },
      ScanIndexForward: false,
      Limit: numOfLatestReviews,
    };

    try {
      const latestReviews = (await db.query(params).promise()).Items.map(mapReview);
      latestReviewsCache.set("reviews-latest", latestReviews);
      return ascendingDate ? latestReviews.reverse() : latestReviews;
    } catch (e) {
      console.trace(e);
    }
  }
};
