module.exports = `
  type Mutation {
    createReview(input: CreateReviewInput!): CreateReviewResult
    voteReview(input: VoteReviewInput!): VoteReviewResult
  }

  type Query {
    reviews(input: ReviewFilter): [Review]!
  }

  input ReviewFilter {
    courseId: String
    ascendingDate: Boolean
    ascendingVote: Boolean
  }

  input CreateReviewInput {
    author: String!
    anonymous: Boolean!
    title: String
    subject: String!
    courseCode: String!
    term: String!
    section: String!
    lecturer: String!
    overall: String!
    grading: ReviewDetailsInput!
    teaching: ReviewDetailsInput!
    difficulty: ReviewDetailsInput!
    content: ReviewDetailsInput!
  }

  type CreateReviewResult {
    id: String
    createdTime: Int
    errorMessage: String
  }

  input VoteReviewInput {
    courseId: String!
    createdDate: String!
    vote: Int!
  }

  type VoteReviewResult {
    review: Review
    errorMessage: String
  }

  type Review {
    id: String!
    author: String!
    anonymous: Boolean!
    title: String
    createdDate: String!
    modifiedDate: String!
    term: String!
    section: String!
    lecturer: String!
    overall: String!
    grading: ReviewDetails!
    teaching: ReviewDetails!
    difficulty: ReviewDetails!
    content: ReviewDetails!
    upvote: Int!
    downvote: Int!
  }

  type ReviewDetails {
    grade: String!
    text: String!
  }

  input ReviewDetailsInput {
    grade: String!
    text: String!
  }
`;
