import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-lambda';
import dotenv from 'dotenv';

import createContext from './context';
import { directivesTypeDefs, addDirectivesToSchema } from './directives';
import loggingPlugin, { formatError } from './plugins/logging';
import resolvers from './resolvers';
import scalarResolvers from './scalars';
import typeDefs from './schemas';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

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
  cache: 'bounded',
  plugins: [loggingPlugin],
  formatError,
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
