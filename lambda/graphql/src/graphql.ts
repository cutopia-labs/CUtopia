import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-lambda';
import dotenv from 'dotenv';
import { connect } from 'mongodb';

import createContext from './context';
import { directivesTypeDefs, addDirectivesToSchema } from './directives';
import loggingPlugin from './plugins/logging';
import resolvers from './resolvers';
import scalarResolvers from './scalars';
import typeDefs from './schemas';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// no need to await, mongoose buffers function calls internally
connect(process.env.ATLAS_URI);

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
  context: createContext,
  introspection: !isProduction,
  plugins: [loggingPlugin],
});

export const graphqlHandler = server.createHandler({
  expressGetMiddlewareOptions: {
    cors: {
      origin: isProduction
        ? ['https://cutopia.app', 'https://dev.cutopia.app']
        : '*',
      methods: ['get', 'post'],
      maxAge: 3600,
    },
  },
});
