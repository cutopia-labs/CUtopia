import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SERVER_CONFIG } from '../config';
import { getCatalogManifest } from './catalog';
import { getToken } from '.';

const httpLink = createHttpLink({
  uri: SERVER_CONFIG.URI,
});
const needsCatalog = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  Object.entries(value).some(
    ([key, child]) =>
      key === 'courseId' || key === 'requiredCourse' || needsCatalog(child)
  );

const authLink = setContext(async (operation, { headers }) => {
  const publicCatalog = operation.query.definitions.some(
    definition =>
      definition.kind === 'OperationDefinition' &&
      definition.selectionSet.selections.some(
        selection =>
          selection.kind === 'Field' &&
          ['course', 'ranking'].includes(selection.name.value)
      )
  );
  const catalog =
    publicCatalog || needsCatalog(operation.variables)
      ? await getCatalogManifest()
      : null;
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      ...(catalog && { 'X-Catalog-Version': catalog.version }),
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

if (typeof window !== 'undefined') {
  window.addEventListener('catalog-updated', () => {
    void client
      .refetchQueries({
        updateCache(cache) {
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'course' });
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'ranking' });
        },
      })
      .catch(() => undefined);
  });
}

export default client;
