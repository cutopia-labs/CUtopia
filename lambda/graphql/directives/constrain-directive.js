const { SchemaDirectiveVisitor } = require('apollo-server-lambda');
const { GraphQLScalarType, GraphQLNonNull } = require('graphql');

/**
 * references:
 * https://www.apollographql.com/docs/apollo-server/v2/schema/creating-directives/#enforcing-value-restrictions
 * https://github.com/ardatan/graphql-tools/issues/858#issuecomment-426590591
 */
class ConstrainDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  visitFieldDefinition(field) {
    this.wrapType(field);
  }

  wrapType(field) {
    if (
      field.type instanceof GraphQLNonNull &&
      field.type.ofType instanceof GraphQLScalarType
    ) {
      field.type = new GraphQLNonNull(
        new ConstrainType(field.type.ofType, this.args)
      );
    } else if (field.type instanceof GraphQLScalarType) {
      field.type = new ConstrainType(field.type, this.args);
    } else {
      throw new Error(`Not a scalar type: ${field.type}.`);
    }
  }
}

class ConstrainType extends GraphQLScalarType {
  constructor(type, { minLen, maxLen, minValue, maxValue }) {
    super({
      name: `Constrain`,

      // server -> client
      serialize(value) {
        value = type.serialize(value);
        if (
          (minLen !== undefined && value.length < minLen) ||
          (maxLen !== undefined && value.length > maxLen)
        ) {
          throw Error(`Invalid length returned: ${value.length}.`);
        }
        return value;
      },

      // client (variable) -> server
      parseValue(value) {
        return type.parseValue(value);
      },

      // client (param) -> server
      parseLiteral(ast) {
        if (
          (minLen !== undefined && ast.value.length < minLen) ||
          (maxLen !== undefined && ast.value.length > maxLen)
        ) {
          throw Error(`Invalid length received: ${ast.value.length}.`);
        }
        if (
          (minValue !== undefined && ast.value < minValue) ||
          (maxValue !== undefined && ast.value > maxValue)
        ) {
          throw Error(`Invalid value received: ${ast.value}.`);
        }
        return type.parseLiteral(ast);
      },
    });
  }
}

module.exports = {
  ConstrainDirective,
};
