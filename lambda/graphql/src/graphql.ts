import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { connect } from 'mongodb';
import dotenv from 'dotenv';

import typeDefs from './schemas';
import resolvers from './resolvers';
import scalarResolvers from './scalars';
import { directivesTypeDefs, addDirectivesToSchema } from './directives';
import createContext from './context';
import loggingPlugin from './plugins/logging';

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
      origin: '*',
      methods: ['get', 'post'],
      credentials: true,
      maxAge: 3600,
    },
  },
});
