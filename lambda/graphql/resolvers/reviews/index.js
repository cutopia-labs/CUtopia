const { getReviews, getReview, createReview, editReview, voteReview, VOTE_ACTIONS } = require('dynamodb');
const { recalWithNewReview, recalWithEdittedReview } = require('../ranking/impl');

exports.Mutation = {
  createReview: async (parent, { input }, { user }) => {
    const { courseRatings, groupRatings } = await recalWithNewReview(input);
    const { id, createdDate } = await createReview(input, user);
    return {
      id,
      createdDate,
      courseRatings,
      groupRatings,
    };
  },
  voteReview: async (parent, { input }, { user }) => {
    return await voteReview(input, user);
  },
  editReview: async (parent, { input }) => {
    const { courseId, createdDate } = input;
    const oldReviewData = await getReview({ courseId, createdDate });
    const { courseRatings, groupRatings } = await recalWithEdittedReview({ oldReviewData, ...input });
    const modifiedDate = await editReview({ oldReviewData, newReviewData: input });
    return {
      modifiedDate,
      courseRatings,
      groupRatings,
    };
  },
};

exports.Review = {
  username: ({ username, anonymous }) => {
    return anonymous ? 'Anonymous' : username;
  },
  myVote: ({ upvotesUserIds, downvotesUserIds }, args, { user }) => { // upvotesUserIds and downvotesUserIds are sets
    if (user) {
      const { username } = user;
      if (upvotesUserIds.values.includes(username)) {
        return VOTE_ACTIONS.UPVOTE;
      }
      if (downvotesUserIds.values.includes(username)) {
        return VOTE_ACTIONS.DOWNVOTE;
      }
    }
    return null;
  },
};

exports.Query = {
  reviews: async (parent, { input }) => {
    return await getReviews(input);
  },
  review: async (parent, { input }) => {
    return await getReview(input);
  },
};

exports.ReviewDetails = {};
