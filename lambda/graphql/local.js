const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer } = require('apollo-server-express');
const { ValidateDirectiveVisitor } = require('@profusion/apollo-validation-directives');
const express = require('express');

const { sign } = require('./jwt');
const typeDefs = require('./types');
const resolvers = require('./resolvers');
const schemaDirectives = require('./directives');
// const createContext = require('./context');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
});
ValidateDirectiveVisitor.addValidationResolversToSchema(schema);

const server = new ApolloServer({
  schema,
  // context: createContext,
  introspection: true,
  playgroud: {
    endpoint: '/graphql'
  }
});

const startApolloServer = async () => {
  await server.start();
  const app = express();
  server.applyMiddleware({ app });
  await new Promise(resolve => app.listen({ port: 4000 }, resolve));
  console.log(`Token: ${sign({
    user: 'mike'
  })}`);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
