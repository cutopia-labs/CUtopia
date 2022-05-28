import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { ErrorCode } from 'cutopia-types/lib/codes';

// reference: https://www.graphql-tools.com/docs/schema-directives#enforcing-access-permissions
const authDirectiveTypeDefs = `directive @auth on OBJECT | FIELD_DEFINITION`;
const authDirectiveTransformer = (schema: GraphQLSchema) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];
      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = (parent, args, context, info) => {
          if (!context.user) {
            throw Error(ErrorCode.AUTHORIZATION_INVALID_TOKEN.toString());
          }
          return resolve(parent, args, context, info);
        };
        return fieldConfig;
      }
    },
  });

export { authDirectiveTypeDefs, authDirectiveTransformer };
