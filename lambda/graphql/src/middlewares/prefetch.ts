import graphqlFields from 'graphql-fields';
import { coursesPreResolver } from '../resolvers/course';

const prefetchResolvers = {
  ...coursesPreResolver,
};

const prefetch = async (resolve, root, args, context, info) => {
  // fetch data before resolving children fields so as to share fetched data accross children resolvers

  // results are assumed to be a list of objects instead of a single object
  // e.g. [Course] instead of Course in graphql schema
  // TODO: support single object
  const results = await resolve(root, args, context, info);

  const fetchResolver = prefetchResolvers[info.fieldName];
  if (fetchResolver) {
    // only fetch data if the graphql request contians the fields below
    const fields = fetchResolver[0];
    const fetchDataFn = fetchResolver[1];
    const requestFields = Object.keys(graphqlFields(info));
    if (fields.some(field => requestFields.includes(field))) {
      return await Promise.all(
        results.map(async result => {
          // pass both parent resolver result and fetched data to children resolvers
          return {
            ...result,
            ...(await fetchDataFn(result, args, context, info)),
          };
        })
      );
    }
  }
  return results;
};

export default prefetch;
