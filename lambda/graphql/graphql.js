const { ApolloServer } = require('apollo-server-lambda');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const courseType = require("./types/courses");
const subjectResolver = require("./resolvers/subjects");

const types = [
  courseType,
];
const mergedTypeDefs = mergeTypeDefs(types);

const resolvers = [
  subjectResolver,
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
