import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { connect } from 'mongodb';
import dotenv from 'dotenv';

import typeDefs from './schemas';
import resolvers from './resolvers';
import createContext from './context';
import schemaDirectives from './directives';
import { applyMiddleware } from 'graphql-middleware';
import middlewares from './middlewares';

dotenv.config();

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  ...schemaDirectives,
} as any);

schema = applyMiddleware(schema, ...middlewares);

const server = new ApolloServer({
  schema,
  context: req =>
    // To fake a lambda request context
    createContext({
      event: {
        headers: {
          Authorization: req.req.headers.authorization,
        },
        requestContext: {
          identity: {
            sourceIp: 'localhost',
          },
        },
      },
    }),
  introspection: true,
});

const startApolloServer = async () => {
  await server.start();

  await connect(process.env.ATLAS_DEV_URI);
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
  app.use(express.json());
  server.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
