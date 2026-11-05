import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from 'graphql-constraint-directive';

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
  let newSchema = catalogTransformer(schema);
  newSchema = authDirectiveTransformer(newSchema);
  newSchema = rateLimitDirectiveTransformer(newSchema);
  newSchema = constraintDirective()(newSchema);
  return newSchema;
};

export { directivesTypeDefs, addDirectivesToSchema };
