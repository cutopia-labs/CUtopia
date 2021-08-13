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

const isProduction = process.env.IsProduction === 'true';
const playground = isProduction
  ? false
  : {
      endpoint: '/graphql'
    };
const allowedOrigins = isProduction
  ? ['https://cutopia.app', 'https://dev.cutopia.app']
  : '*';

const server = new ApolloServer({
  schema,
  context: createContext,
  introspection: !isProduction,
  playground
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: allowedOrigins,
    methods: ['get', 'post'],
    credentials: true,
    maxAge: 3600
  }
});
