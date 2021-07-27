const {
  getReviews,
  getReview,
  createReview,
  editReview,
  voteReview,
  REPORT_CATEGORIES,
  REVIEW_REPORT_TYPES,
  COURSE_REPORT_TYPES,
  VOTE_ACTIONS,
} = require('dynamodb');
const {
  recalWithNewReview,
  recalWithEdittedReview,
} = require('../ranking/impl');

exports.Mutation = {
  createReview: async (parent, { input }, { user }) => {
    const { id, createdDate } = await createReview(input, user);
    const { courseRatings, groupRatings } = await recalWithNewReview(input);
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
  editReview: async (parent, { input }, { validateOwner }) => {
    const { courseId, createdDate } = input;
    const oldReviewData = await getReview({ courseId, createdDate });
    validateOwner(oldReviewData.username);

    const modifiedDate = await editReview({
      oldReviewData,
      newReviewData: input,
    });
    const { courseRatings, groupRatings } = await recalWithEdittedReview({
      oldReviewData,
      ...input,
    });
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
  myVote: ({ upvotesUserIds, downvotesUserIds }, args, { user }) => {
    if (user) {
      const { username } = user;
      // upvotesUserIds and downvotesUserIds are sets
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
/**
 * seems union of scalars and input with union are still under discussion now: 
 * https://github.com/graphql/graphql-spec/issues/215
 * https://github.com/graphql/graphql-spec/issues/488
 * 
 * exports.ReportType = {
 *   __resolveType: (report) => {
 *     switch(report.cat) {
 *       case 'COURSE': return 'CourseInfoReportType';
 *       case 'REVIEW': return 'ReviewReportType';
 *     }
 *   },
 * };
 * 
 * exports.CourseInfoReportType = COURSE_REPORT_TYPES;
 * 
 * exports.ReviewReportType = REVIEW_REPORT_TYPES;
 */

exports.ReportCategory = REPORT_CATEGORIES;
