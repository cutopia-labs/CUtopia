module.exports = `
  type Mutation {
    createReview(input: CreateReviewInput): CreateReviewResult
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

  input ReviewFilter {
    random: Int
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
