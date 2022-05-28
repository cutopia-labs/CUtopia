import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from 'graphql-constraint-directive';
import { authDirectiveTypeDefs, authDirectiveTransformer } from './auth';
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
  let newSchema = authDirectiveTransformer(schema);
  newSchema = rateLimitDirectiveTransformer(schema);
  newSchema = constraintDirective()(newSchema);
  return newSchema;
};

export { directivesTypeDefs, addDirectivesToSchema };
