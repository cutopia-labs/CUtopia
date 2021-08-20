import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ValidateDirectiveVisitor } from '@profusion/apollo-validation-directives';
import express from 'express';
require('dotenv').config();

import typeDefs from './schemas';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import createContext from './context';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives,
} as any);

ValidateDirectiveVisitor.addValidationResolversToSchema(schema);

const isProduction = process.env.IsProduction === 'true';
const allowedOrigins = isProduction
  ? ['https://cutopia.app', 'https://dev.cutopia.app']
  : '*';

const server = new ApolloServer({
  schema,
  context: createContext,
  introspection: !isProduction,
});

export const graphqlHandler = server.createHandler({
  expressAppFromMiddleware(middleware) {
    const app = express();
    app.use(
      '/static',
      express.static(__dirname + '/data/derivatives', {
        etag: true,
        setHeaders: (res, path, stat) => {
          res.header('Access-Control-Allow-Origin', allowedOrigins);
          res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type');
          res.header('Access-Control-Allow-Headers', 'Accept');
        },
      }),
      (req, res) => {
        res.sendStatus(200);
      }
    );
    app.use(middleware, (req, res) => {
      res.sendStatus(200);
    });
    return app;
  },
  expressGetMiddlewareOptions: {
    cors: {
      origin: allowedOrigins,
      methods: ['get', 'post'],
      credentials: true,
      maxAge: 3600,
    },
  },
});
