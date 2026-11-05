import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

import { getCatalogManifest, validateCourseIds } from '../utils/catalog';

const hasCourseId = (args: unknown): boolean =>
  !!args &&
  typeof args === 'object' &&
  Object.entries(args).some(
    ([key, value]) =>
      ((key === 'courseId' || key === 'requiredCourse') && !!value) ||
      hasCourseId(value)
  );

// Scalars are synchronous. Check directory membership before any resolver can
// read or mutate course-related data, including authenticated mutations.
export const catalogTransformer = (schema: GraphQLSchema) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (field, name, type) => {
      if (type !== 'Query' && type !== 'Mutation') return field;
      const resolve = field.resolve || defaultFieldResolver;
      field.resolve = async (parent, args, context, info) => {
        if (hasCourseId(args)) {
          context.catalog = await getCatalogManifest(context.catalogVersion);
          await validateCourseIds(args, context.catalog);
        }
        return resolve(parent, args, context, info);
      };
      return field;
    },
  });
