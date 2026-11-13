import { CatalogManifest } from 'cutopia-types';

import { Token, verify } from '../jwt';

export interface Context {
  user: Token;
  ip: string;
  catalog?: CatalogManifest;
  catalogVersion?: string;
  courseReviews?: Map<string, Promise<any>>;
}

const context = async ({ event: lambdaEvent }) => {
  const ip = lambdaEvent.requestContext.identity.sourceIp;
  const headers = lambdaEvent.headers || {};
  const split = (headers.Authorization || headers.authorization || '').split(
    'Bearer '
  );

  const defaultContext = {
    user: null,
    ip,
    catalogVersion:
      headers['X-Catalog-Version'] || headers['x-catalog-version'],
  };

  if (split.length !== 2) {
    return defaultContext;
  }
  const token = split[1];
  const userContext = await verify(token);
  return {
    ...defaultContext,
    user: userContext,
  };
};

export default context;
