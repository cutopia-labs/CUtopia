import authDirective from './auth';
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from 'graphql-constraint-directive';
import {
  defaultKeyGenerator,
  rateLimitDirective,
} from 'graphql-rate-limit-directive';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { Context } from '../context';

const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth');
// reference: https://github.com/ravangen/graphql-rate-limit/tree/master/examples/context
const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
  rateLimitDirective({
    keyGenerator: (...params) =>
      `${(params[3] as Context).ip}:${defaultKeyGenerator(...params)}`,
    onLimit: () => {
      throw new Error(ErrorCode.EXCEED_RATE_LIMIT.toString());
    },
  });

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
