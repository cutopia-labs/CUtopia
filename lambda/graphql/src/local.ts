import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { connect } from 'mongodb';
import dotenv from 'dotenv';

import typeDefs from './schemas';
import resolvers from './resolvers';
import scalarResolvers from './scalars';
import createContext from './context';
import { directivesTypeDefs, addDirectivesToSchema } from './directives';
import loggingPlugin from './plugins/logging';

dotenv.config();

let schema = makeExecutableSchema({
  typeDefs: [...directivesTypeDefs, ...typeDefs],
  resolvers: {
    ...scalarResolvers,
    ...resolvers,
  },
});
schema = addDirectivesToSchema(schema);

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
  plugins: [loggingPlugin],
});

const startApolloServer = async () => {
  await server.start();

  await connect(process.env.ATLAS_DEV_URI);
  const app = express();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

startApolloServer();
