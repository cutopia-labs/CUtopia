const { SchemaDirectiveVisitor } = require('apollo-server-lambda');
const { defaultFieldResolver } = require('graphql');

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { role } = this.args;

    field.resolve = async (...params) => {
      const [parent, args, context, info] = params;
      if (!context.authenticated) {
        throw Error('Unauthorized: requires login.');
      }

      const validateOwner = (owner) => {
        if (role === 'OWNER' && owner !== context.user.username) {
          throw Error('Unauthorized: not owner.');
        }
      };

      return await resolve.apply(this, [
        parent,
        args,
        { validateOwner, ...context },
        info,
      ]);
    };
  }
}

module.exports = {
  AuthDirective,
};
