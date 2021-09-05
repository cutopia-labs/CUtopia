import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import express from 'express';
import { connect } from 'mongodb';
import dotenv from 'dotenv';

import typeDefs from './schemas';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import createContext from './context';
import middlewares from './middlewares';
import loggingPlugin from './plugins/logging';

dotenv.config();

// no need to await, mongoose buffers function calls internally
connect(process.env.ATLAS_URI);

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  ...schemaDirectives,
} as any);
schema = applyMiddleware(schema, ...middlewares);

const isProduction = process.env.NODE_ENV === 'production';
/*
const allowedOrigins = isProduction
  ? ['https://cutopia.app', 'https://dev.cutopia.app']
  : '*';
*/

const server = new ApolloServer({
  schema,
  context: createContext,
  introspection: !isProduction,
  plugins: [loggingPlugin],
});

export const graphqlHandler = server.createHandler({
  expressAppFromMiddleware(middleware) {
    const app = express();
    app.use(
      '/static',
      express.static(__dirname + '/data/static', {
        etag: true,
        setHeaders: (res, path, stat) => {
          res.header('Access-Control-Allow-Origin', '*');
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
      origin: '*',
      methods: ['get', 'post'],
      credentials: true,
      maxAge: 3600,
    },
  },
});
