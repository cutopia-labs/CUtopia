import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from 'graphql-constraint-directive';

import { requireDatabase } from '../utils/database';

import { authDirectiveTypeDefs, authDirectiveTransformer } from './auth';
import { catalogTransformer } from './catalog';
import {
  rateLimitDirectiveTypeDefs,
  rateLimitDirectiveTransformer,
} from './rateLimit';

const directivesTypeDefs = [
  authDirectiveTypeDefs,
  rateLimitDirectiveTypeDefs,
  constraintDirectiveTypeDefs,
];
const addDirectivesToSchema = schema => {
  const databaseSchema = mapSchema(schema, {
    [MapperKind.ROOT_FIELD]: (field, name, type) => {
      if (
        type === schema.getQueryType().name &&
        ['course', 'ranking'].includes(name)
      )
        return field;
      const resolve = field.resolve || defaultFieldResolver;
      return {
        ...field,
        resolve: async (parent, args, context, info) => {
          await requireDatabase();
          return resolve(parent, args, context, info);
        },
      };
    },
  });
  let newSchema = catalogTransformer(databaseSchema);
  newSchema = authDirectiveTransformer(newSchema);
  newSchema = rateLimitDirectiveTransformer(newSchema);
  newSchema = constraintDirective()(newSchema);
  return newSchema;
};

export { directivesTypeDefs, addDirectivesToSchema };
