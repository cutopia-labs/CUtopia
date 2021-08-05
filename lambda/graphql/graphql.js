const { ApolloServer, makeExecutableSchema } = require('apollo-server-lambda');
const { ValidateDirectiveVisitor } = require('@profusion/apollo-validation-directives');

const typeDefs = require('./types');
const resolvers = require('./resolvers');
const schemaDirectives = require('./directives');
const createContext = require('./context');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
});
ValidateDirectiveVisitor.addValidationResolversToSchema(schema);

const server = new ApolloServer({
  schema,
  context: createContext,
  playground: {
    endpoint: '/graphql'
  }
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
    methods: ['get', 'post'],
    credentials: true,
    maxAge: 3600
  }
});
