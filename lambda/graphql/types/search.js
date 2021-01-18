module.exports = `
  type Query {
    search: SearchTable
  }

  type SearchTable {
    courses(input: SearchCoursesInput): [Course]!
  }

  input SearchCoursesInput {
    text: String!
    limit: Int
  }
`;
