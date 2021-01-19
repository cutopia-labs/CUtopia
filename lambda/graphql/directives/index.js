const { SchemaDirectiveVisitor } = require("apollo-server-lambda");
const { defaultFieldResolver } = require("graphql");

class AuthDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...params) => {
      const [parent, args, context, info] = params;
      if (!context.authenticated) {
        throw Error("Unauthorized");
      }

      return await resolve.apply(this, params);
    };
  }
}

module.exports = {
  auth: AuthDirectiveVisitor,
};
