const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer } = require('apollo-server-express');
const { ValidateDirectiveVisitor } = require('@profusion/apollo-validation-directives');
const express = require('express');

import { sign } from './jwt';
import typeDefs from './types';
import resolvers from './resolvers';
import schemaDirectives from './directives';
// const createContext = require('./context');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
} as any);

ValidateDirectiveVisitor.addValidationResolversToSchema(schema);

const server = new ApolloServer({
  schema,
  // context: createContext,
  introspection: true,
});

const startApolloServer = async () => {
  await server.start();
  const app = express();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log(`Token: ${sign({
    user: 'mike'
  })}`);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
