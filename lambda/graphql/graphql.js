const { ApolloServer } = require('apollo-server-lambda');

const typeDefs = require("./types");
const resolvers = require("./resolvers");
const schemaDirectives = require("./directives");
const createContext = require("./context");

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  schemaDirectives,
  context: createContext,
  playground: {
    endpoint: "/graphql",
  },
});

exports.graphqlHandler = server.createHandler();
