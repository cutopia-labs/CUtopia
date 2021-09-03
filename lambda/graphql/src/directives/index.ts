import { AuthDirective } from './auth-directive';
import { createRateLimitDirective } from 'graphql-rate-limit';
import { constraintDirective } from 'graphql-constraint-directive';
import { ErrorCode } from 'cutopia-types/lib/codes';

const RateLimitDirective = createRateLimitDirective({
  identifyContext: context =>
    context.user ? context.user.username : context.ip,
  createError: () => new Error(ErrorCode.EXCEED_RATE_LIMIT.toString()),
});

const directives = {
  schemaDirectives: {
    auth: AuthDirective,
    rateLimit: RateLimitDirective,
  },
  schemaTransforms: [constraintDirective()],
};

export default directives;
