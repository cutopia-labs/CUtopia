const { nanoid } = require('nanoid');
const NodeCache = require('node-cache');
const AWS = require('aws-sdk');
const { incrementUpvotesCount, getUser } = require('./user-db');
const { addCourseData } = require('./course-db');
const { ErrorCode, VoteAction } = require('cutopia-types/lib/codes');

const db = new AWS.DynamoDB.DocumentClient();

const latestReviewsCache = new NodeCache({
  stdTTL: 300,
});
const numOfLatestReviews = 20;

const allReviewsCache = new NodeCache({
  stdTTL: 1800,
});

exports.createReview = async (input, user) => {
  const now = new Date().getTime().toString();
  const { courseId, ...reviewData } = input;
  const reviewId = nanoid(10);
  const { username } = user;

  const review = {
    username: username,
    courseId: courseId,
    reviewId: reviewId,
    createdDate: now,
    modifiedDate: now,
    upvotes: 0,
    upvotesUserIds: db.createSet(['']),
    downvotes: 0,
    downvotesUserIds: db.createSet(['']),
    ...reviewData,
  };

  // parameters for inserting new review into reviews database
  const addReviewParams = {
    TableName: process.env.ReviewsTableName,
    Item: review,
  };

  const latestReview = {
    ...review,
    primaryKey: 'reviews-latest',
    sortKey: `${now}#${reviewId}`,
  };

  // parameters for inserting new review into latest reviews database
  const addLatestReviewParams = {
    TableName: process.env.LatestReviewsTableName,
    Item: latestReview,
  };

  const { reviewIds } = await getUser({
    username,
    requiredFields: ['reviewIds'],
  });
  if (reviewIds.values.some(id => id.includes(courseId))) {
    throw Error(ErrorCode.CREATE_REVIEW_ALREADY_CREATED);
  }

  // give extra review for writing the first review
  // there is an empty string in reviewIds to initialize the reviewIds field
  const exp = reviewIds.values.length === 1 ? 5 : 3;
  const addToMyReviewsParams = {
    TableName: process.env.UserTableName,
    Key: {
      username,
    },
    // TODO: delete full access each semester
    UpdateExpression:
      'add reviewIds :reviewId set exp = if_not_exists(exp, :defaultExp) + :exp, fullAccess = :fullAccess',
    ExpressionAttributeValues: {
      ':defaultExp': 0,
      ':exp': exp,
      ':reviewId': db.createSet(`${courseId}#${now}`),
      ':fullAccess': true,
    },
  };

  await addCourseData({
    courseId,
    lecturer: reviewData.lecturer,
    term: reviewData.term,
  });

  try {
    // TODO: TransactWriteItems?
    await Promise.all([
      db.put(addReviewParams).promise(),
      db.put(addLatestReviewParams).promise(),
      db.update(addToMyReviewsParams).promise(),
    ]);

    const latestReviews = latestReviewsCache.get('reviews-latest');
    if (latestReviews) {
      latestReviews.unshift(mapReview(latestReview)); // the list is ordered by descending date by default
      latestReviewsCache.set('reviews-latest', latestReviews);
    }

    return {
      id: reviewId,
      createdDate: now,
    };
  } catch (e) {
    console.trace(e);
  }
};

exports.editReview = async input => {
  const { oldReviewData, newReviewData } = input;
  const now = new Date().getTime().toString();

  const params = {
    TableName: process.env.ReviewsTableName,
    Item: {
      ...oldReviewData,
      ...newReviewData,
      modifiedDate: now,
    },
  };
  await db.put(params).promise();
  return now;
};

exports.voteReview = async (input, user) => {
  const { courseId, createdDate, vote } = input;
  const { username } = user;
  if (vote !== 0 && vote !== 1) {
    // vote must be either 0 or 1
    throw Error(ErrorCode.VOTE_REVIEW_INVALID_VALUE);
  }

  const isUpvote = vote === VoteAction.UPVOTE;
  const params = {
    TableName: process.env.ReviewsTableName,
    Key: {
      courseId,
      createdDate,
    },
    UpdateExpression:
      (isUpvote
        ? 'set upvotes = upvotes + :val '
        : 'set downvotes = downvotes + :val ') +
      (isUpvote
        ? 'add upvotesUserIds :usernameSet'
        : 'add downvotesUserIds :usernameSet'),
    ConditionExpression:
      'not (contains(upvotesUserIds, :username) or contains(downvotesUserIds, :username))',
    ExpressionAttributeValues: {
      ':val': 1,
      ':username': username,
      ':usernameSet': db.createSet(username),
    },
    ReturnValues: 'ALL_NEW',
  };

  let result;
  try {
    result = await db.update(params).promise();
  } catch (e) {
    if (e.code === 'ConditionalCheckFailedException') {
      throw Error(ErrorCode.VOTE_REVIEW_VOTED_ALREADY);
    }
  }
  const { reviewId, ...reviewData } = result.Attributes;
  if (isUpvote) {
    const reviewAuthor = reviewData.username;
    await incrementUpvotesCount({ username: reviewAuthor });
  }

  return {
    id: reviewId,
    ...reviewData,
  };
};

const mapReview = review => {
  const { primaryKey, sortKey, reviewId, ...reviewData } = review;
  return {
    id: reviewId,
    ...reviewData,
  };
};
exports.getReviews = async input => {
  const {
    courseId,
    getLatest,
    getAll,
    lecturer,
    term,
    ascendingDate,
    ascendingVote,
    lastEvaluatedKey = null,
    limit = 10,
  } = { ...input };

  if (courseId) {
    // return reviews of a course
    const sortByVotes = ascendingVote !== null;
    const sortByDate = ascendingDate !== null;
    if (sortByVotes && sortByDate) {
      // either sort by votes or date
      throw Error(ErrorCode.GET_REVIEW_INVALID_SORTING);
    }
    if (lastEvaluatedKey !== null && !sortByVotes) {
      delete lastEvaluatedKey.upvotes;
    }

    let params = {
      TableName: process.env.ReviewsTableName,
      KeyConditionExpression: 'courseId = :courseId',
      ExpressionAttributeValues: {
        ':courseId': courseId,
      },
      ...(lastEvaluatedKey !== null && { ExclusiveStartKey: lastEvaluatedKey }),
      Limit: limit,
    };

    if (sortByDate) {
      params = {
        ...params,
        ScanIndexForward: ascendingDate,
      };
    } else if (sortByVotes) {
      params = {
        ...params,
        IndexName: process.env.ReviewsByVoteIndexName,
        ScanIndexForward: ascendingVote,
      };
    }

    if (lecturer !== undefined) {
      params = {
        ...params,
        FilterExpression: 'lecturer = :lecturer',
        ExpressionAttributeValues: {
          ...params.ExpressionAttributeValues,
          ':lecturer': lecturer,
        },
      };
    }

    if (term !== undefined) {
      params = {
        ...params,
        FilterExpression: `${
          params.FilterExpression ? params.FilterExpression + ' and ' : ''
        }term = :term`,
        ExpressionAttributeValues: {
          ...params.ExpressionAttributeValues,
          ':term': term,
        },
      };
    }

    const result = await db.query(params).promise();
    const reviews = result.Items.map(review => {
      const { courseId, reviewId, ...rest } = review;
      return {
        ...rest,
        id: reviewId,
        courseId: courseId,
      };
    });

    return {
      reviews,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  if (getLatest) {
    // return latest reviews from cache
    const cachedReviews = latestReviewsCache.get('reviews-latest');
    if (cachedReviews) {
      return {
        reviews: ascendingDate ? cachedReviews.reverse() : cachedReviews,
        lastEvaluatedKey: null,
      };
    }

    // return latest reviews from database
    const params = {
      TableName: process.env.LatestReviewsTableName,
      KeyConditionExpression: 'primaryKey = :key',
      ExpressionAttributeValues: {
        ':key': 'reviews-latest',
      },
      ScanIndexForward: false,
      Limit: numOfLatestReviews,
    };

    const latestReviews = (await db.query(params).promise()).Items.map(
      mapReview
    );
    latestReviewsCache.set('reviews-latest', latestReviews);
    return {
      reviews: ascendingDate ? latestReviews.reverse() : latestReviews,
      lastEvaluatedKey: null,
    };
  }

  if (getAll) {
    // return all reviews from cache
    const cachedReviews = allReviewsCache.get('all-reviews');
    if (cachedReviews) {
      return cachedReviews;
    }

    // return all reviews from database
    const params = {
      TableName: process.env.ReviewsTableName,
      ProjectionExpression: 'courseId, grading, difficulty, teaching, content',
    };
    const reviews = (await db.scan(params).promise()).Items;
    allReviewsCache.set('all-reviews', reviews);
    return reviews;
  }
};

exports.getReview = async input => {
  const { courseId, createdDate } = { ...input };

  const params = {
    TableName: process.env.ReviewsTableName,
    Key: {
      courseId,
      createdDate,
    },
  };

  const review = mapReview((await db.get(params).promise()).Item);
  return review;
};
