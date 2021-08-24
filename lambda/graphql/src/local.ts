import { makeExecutableSchema } from '@graphql-tools/schema';
const { ApolloServer } = require('apollo-server-express');
import { ValidateDirectiveVisitor } from '@profusion/apollo-validation-directives';
import express from 'express';
import { connect } from 'mongodb';
import dotenv from 'dotenv';

import { sign } from './jwt';
import typeDefs from './schemas';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import reviewRouter from './routes/reviews';
import courseRouter from './routes/courses';
import reportRouter from './routes/reports';
import rankingRouter from './routes/rankings';
import timetableRouter from './routes/timetables';
import discussionRouter from './routes/discussions';

dotenv.config();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives,
} as any);

ValidateDirectiveVisitor.addValidationResolversToSchema(schema);
const server = new ApolloServer({
  schema,
  introspection: true,
} as any);

const startApolloServer = async () => {
  await server.start();

  await connect(process.env.ATLAS_URI);
  const app = express();
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  app.use(
    '/static',
    express.static(__dirname + '/data/derivatives', {
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
  app.use('/reviews', reviewRouter);
  app.use('/courses', courseRouter);
  app.use('/timetables', timetableRouter);
  app.use('/reports', reportRouter);
  app.use('/rankings', rankingRouter);
  app.use('/discussions', discussionRouter);
  server.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log(
    `Token: ${sign({
      user: 'mike',
    })}`
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
