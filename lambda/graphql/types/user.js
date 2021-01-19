module.exports = `
  type Query {
    user: SearchTable
  }

  type User {
    name: String!
    email: String!
    verified: Boolean!
  }

  type Mutation {
    createUser(input: CreateUserInput!): CreateUserResult!
    verifyUser(input: VerifyUserInput!): VerifyUserResult!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  type CreateUserResult {
    error: String
  }

  input VerifyUserInput {
    email: String!
    code: String!
  }

  type VerifyUserResult {
    code: Int!
  }
`;
