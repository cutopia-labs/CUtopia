import {
  defaultKeyGenerator,
  rateLimitDirective,
} from 'graphql-rate-limit-directive';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { Context } from '../context';

// reference: https://github.com/ravangen/graphql-rate-limit/tree/master/examples/context
const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
  rateLimitDirective({
    keyGenerator: (...params) =>
      `${(params[3] as Context).ip}:${defaultKeyGenerator(...params)}`,
    onLimit: () => {
      throw new Error(ErrorCode.EXCEED_RATE_LIMIT.toString());
    },
  });

export { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer };
