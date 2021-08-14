import { SchemaDirectiveVisitor } from 'apollo-server-lambda';
import { defaultFieldResolver } from 'graphql';
import { ErrorCode } from 'cutopia-types/lib/codes';

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field;
    const { role } = this.args;

    field.resolve = async (...params) => {
      const [parent, args, context, info] = params;
      if (!context.authenticated) {
        throw Error(ErrorCode.AUTHORIZATION_REQUIRES_LOGIN as any);
      }

      const validateOwner = (owner) => {
        if (role === 'OWNER' && owner !== context.user.username) {
          throw Error(ErrorCode.AUTHORIZATION_REQUIRES_OWNER as any);
        }
      };

      return await resolve.apply(this, [
        parent,
        args,
        { validateOwner, ...context },
        info
      ]);
    };
  }
}

export {
  AuthDirective
};
