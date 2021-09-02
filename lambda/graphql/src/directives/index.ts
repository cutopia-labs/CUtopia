import { AuthDirective } from './auth-directive';
import { range, stringLength } from '@profusion/apollo-validation-directives';
import { createRateLimitDirective } from 'graphql-rate-limit';
import { ErrorCode } from 'cutopia-types/lib/codes';

const RateLimitDirective = createRateLimitDirective({
  identifyContext: context =>
    context.user ? context.user.username : context.ip,
  createError: () => new Error(ErrorCode.EXCEED_RATE_LIMIT.toString()),
});

const directives = {
  auth: AuthDirective,
  rateLimit: RateLimitDirective,
  range,
  stringLength,
};

export default directives;
