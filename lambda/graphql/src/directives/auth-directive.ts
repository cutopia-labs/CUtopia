import { defaultFieldResolver } from 'graphql';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { SchemaDirectiveVisitor } from 'graphql-tools';

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async (...params) => {
      const [parent, args, context, info] = params;
      if (!context.user) {
        throw Error(ErrorCode.AUTHORIZATION_INVALID_TOKEN.toString());
      }

      return await resolve.apply(this, [parent, args, context, info]);
    };
  }
}

export default AuthDirective;
