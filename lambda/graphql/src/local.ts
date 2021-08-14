import { makeExecutableSchema } from '@graphql-tools/schema';
const { ApolloServer } = require('apollo-server-express');
import { ValidateDirectiveVisitor } from '@profusion/apollo-validation-directives';
import express from 'express';

import { sign } from './jwt';
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

const server = new ApolloServer({
  schema,
  introspection: true,
} as any);

const startApolloServer = async () => {
  await server.start();
  const app = express();
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  app.use('/static', express.static(__dirname + '/data/derivatives', {
    etag: true,
  }))
  server.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log(`Token: ${sign({
    user: 'mike'
  })}`);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
