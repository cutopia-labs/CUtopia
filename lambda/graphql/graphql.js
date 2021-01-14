const { ApolloServer } = require('apollo-server-lambda');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const courseType = require("./types/courses");
const reviewType = require("./types/reviews");

const subjectResolver = require("./resolvers/subjects");
const reviewResolver = require("./resolvers/reviews");

const types = [
  courseType,
  reviewType,
];
const mergedTypeDefs = mergeTypeDefs(types);

const resolvers = [
  subjectResolver,
  reviewResolver,
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
