import { ApolloServer, makeExecutableSchema } from 'apollo-server-lambda';
import { ValidateDirectiveVisitor } from '@profusion/apollo-validation-directives';

import typeDefs from './types';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import createContext from './context';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
} as any);

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

export const graphqlHandler = server.createHandler({
  cors: {
    origin: allowedOrigins,
    methods: ['get', 'post'],
    credentials: true,
    maxAge: 3600
  }
});
