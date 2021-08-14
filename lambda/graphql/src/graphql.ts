import { ApolloServer } from 'apollo-server-lambda'
import { makeExecutableSchema } from '@graphql-tools/schema';;
import { ValidateDirectiveVisitor } from '@profusion/apollo-validation-directives';
import express from 'express';


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
  introspection: !isProduction
});

export const graphqlHandler = server.createHandler({
  expressGetMiddlewareOptions: {
    cors: {
      origin: allowedOrigins,
      methods: ['get', 'post'],
      credentials: true,
      maxAge: 3600
    },
  },
  expressAppFromMiddleware(middleware) {
    const app = express();
    app.use('/static', express.static(__dirname + '/data/derivatives', {
      etag: true,
    }))
    app.use(middleware)
    return app;
  }
});
