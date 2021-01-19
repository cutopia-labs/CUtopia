const { ApolloServer } = require('apollo-server-lambda');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const courseType = require("./types/courses");
const reviewType = require("./types/reviews");
const searchType = require("./types/search");
const userType = require("./types/user");

const subjectResolver = require("./resolvers/subjects");
const reviewResolver = require("./resolvers/reviews");
const searchResolver = require("./resolvers/search");
const userResolver = require("./resolvers/user");

const types = [
  courseType,
  reviewType,
  searchType,
  userType,
];
const mergedTypeDefs = mergeTypeDefs(types);

const resolvers = [
  subjectResolver,
  reviewResolver,
  searchResolver,
  userResolver,
];
const mergedResolvers = mergeResolvers(resolvers);

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  playground: {
    endpoint: "/graphql",
  },
});

exports.graphqlHandler = server.createHandler();
